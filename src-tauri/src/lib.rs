use tauri::Emitter;
#[cfg(not(target_os = "macos"))]
use tauri::Manager;

#[cfg(target_os = "macos")]
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

#[tauri::command]
fn read_file_by_path(path: String) -> Result<Option<Vec<u8>>, String> {
    let p = std::path::Path::new(&path);
    if !p.exists() {
        return Ok(None);
    }
    std::fs::read(p)
        .map(Some)
        .map_err(|e| format!("Datei konnte nicht gelesen werden: {e}"))
}

#[cfg(target_os = "macos")]
fn build_macos_menu(app: &tauri::AppHandle) -> tauri::Result<tauri::menu::Menu<tauri::Wry>> {
    let app_menu = SubmenuBuilder::new(app, "Eren Struktogrammer")
        .item(&MenuItemBuilder::with_id("help-about", "Über Eren Struktogrammer…").build(app)?)
        .item(&MenuItemBuilder::with_id("help-update", "Nach Updates suchen…").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("options-settings", "Einstellungen…").accelerator("CmdOrCtrl+,").build(app)?)
        .separator()
        .item(&PredefinedMenuItem::hide(app, Some("Ausblenden"))?)
        .item(&PredefinedMenuItem::hide_others(app, Some("Andere ausblenden"))?)
        .item(&PredefinedMenuItem::show_all(app, Some("Alle einblenden"))?)
        .separator()
        .item(&PredefinedMenuItem::quit(app, Some("Beenden"))?)
        .build()?;

    let file_menu = SubmenuBuilder::new(app, "Datei")
        .item(&MenuItemBuilder::with_id("file-new-project", "Neues Projekt").accelerator("CmdOrCtrl+N").build(app)?)
        .item(&MenuItemBuilder::with_id("file-new-diagram", "Neues Struktogramm").accelerator("CmdOrCtrl+Shift+N").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("file-open-project", "Projekt öffnen…").accelerator("CmdOrCtrl+O").build(app)?)
        .item(&MenuItemBuilder::with_id("file-save-project", "Projekt speichern").accelerator("CmdOrCtrl+S").build(app)?)
        .item(&MenuItemBuilder::with_id("file-save-project-as", "Projekt speichern unter…").accelerator("CmdOrCtrl+Shift+S").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("file-share-create", "Link erstellen (24h)…").build(app)?)
        .item(&MenuItemBuilder::with_id("file-share-open", "Link öffnen…").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("file-print", "Drucken…").accelerator("CmdOrCtrl+P").build(app)?)
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Bearbeiten")
        .item(&MenuItemBuilder::with_id("edit-undo", "Rückgängig").accelerator("CmdOrCtrl+Z").build(app)?)
        .item(&MenuItemBuilder::with_id("edit-redo", "Wiederholen").accelerator("CmdOrCtrl+Shift+Z").build(app)?)
        .separator()
        .item(&PredefinedMenuItem::cut(app, Some("Ausschneiden"))?)
        .item(&PredefinedMenuItem::copy(app, Some("Kopieren"))?)
        .item(&PredefinedMenuItem::paste(app, Some("Einfügen"))?)
        .item(&PredefinedMenuItem::select_all(app, Some("Alles auswählen"))?)
        .build()?;

    let view_menu = SubmenuBuilder::new(app, "Ansicht")
        .item(&MenuItemBuilder::with_id("view-zoom-in", "Arbeitsfläche vergrößern").accelerator("CmdOrCtrl+=").build(app)?)
        .item(&MenuItemBuilder::with_id("view-zoom-out", "Arbeitsfläche verkleinern").accelerator("CmdOrCtrl+-").build(app)?)
        .item(&MenuItemBuilder::with_id("view-reset", "Ansicht zurücksetzen").accelerator("CmdOrCtrl+0").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("view-ui-up", "Oberfläche vergrößern (UI)").build(app)?)
        .item(&MenuItemBuilder::with_id("view-ui-down", "Oberfläche verkleinern (UI)").build(app)?)
        .item(&MenuItemBuilder::with_id("view-ui-reset", "Oberfläche 100%").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("view-arrange", "Im Raster anordnen").build(app)?)
        .build()?;

    let help_menu = SubmenuBuilder::new(app, "Hilfe")
        .item(&MenuItemBuilder::with_id("help-shortcuts", "Schnellhilfe & Tastenkürzel").build(app)?)
        .item(&MenuItemBuilder::with_id("help-download", "Download (macOS / Windows)").build(app)?)
        .item(&MenuItemBuilder::with_id("help-update", "Nach Updates suchen…").build(app)?)
        .separator()
        .item(&MenuItemBuilder::with_id("help-about", "Über Eren Struktogrammer / Impressum").build(app)?)
        .build()?;

    MenuBuilder::new(app)
        .items(&[&app_menu, &file_menu, &edit_menu, &view_menu, &help_menu])
        .build()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                if let Ok(menu) = build_macos_menu(app.handle()) {
                    let _ = app.set_menu(menu);
                }
            }
            #[cfg(not(target_os = "macos"))]
            {
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.remove_menu();
                }
            }
            Ok(())
        })
        .on_menu_event(|app, event| {
            let _ = app.emit("menu-action", event.id().0.clone());
        })
        .invoke_handler(tauri::generate_handler![read_file_by_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
