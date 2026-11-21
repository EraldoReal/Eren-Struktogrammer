use serde::Serialize;
use std::process::Command;
use tauri::{Emitter, Manager};

#[cfg(target_os = "macos")]
use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCheckResult {
    pub current_version: String,
    pub latest_version: String,
    pub available: bool,
    pub download_url: String,
    pub notes: String,
}

fn parse_semver(v: &str) -> (u32, u32, u32) {
    let cleaned = v.trim().trim_start_matches('v');
    let mut parts = cleaned.split('.').map(|s| s.parse::<u32>().unwrap_or(0));
    (
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
    )
}

#[tauri::command]
fn check_app_update(app: tauri::AppHandle) -> Result<UpdateCheckResult, String> {
    let current_version = app.package_info().version.to_string();
    let manifest_url = "https://strukto.best-tools.app/downloads/version.json";

    let output = Command::new("curl")
        .args(["-fsSL", "--max-time", "10", manifest_url])
        .output()
        .map_err(|e| format!("Fehler beim Abrufen der Update-Informationen: {e}"))?;

    if !output.status.success() {
        return Err("Update-Server konnte nicht erreicht werden.".to_string());
    }

    let body = String::from_utf8_lossy(&output.stdout);
    let json: serde_json::Value =
        serde_json::from_str(&body).map_err(|e| format!("Ungültiges Update-Manifest: {e}"))?;

    let latest_version = json["version"]
        .as_str()
        .unwrap_or(&current_version)
        .to_string();
    let notes = json["notes"].as_str().unwrap_or("").to_string();

    #[cfg(target_os = "macos")]
    let download_url = json["macUrl"].as_str().unwrap_or("").to_string();
    #[cfg(target_os = "windows")]
    let download_url = json["winUrl"].as_str().unwrap_or("").to_string();
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    let download_url = json["linuxUrl"].as_str().unwrap_or("").to_string();

    let available = parse_semver(&latest_version) > parse_semver(&current_version);

    Ok(UpdateCheckResult {
        current_version,
        latest_version,
        available,
        download_url,
        notes,
    })
}

#[tauri::command]
fn install_app_update(download_url: String) -> Result<String, String> {
    if download_url.is_empty() {
        return Err("Kein Download-Link für diese Plattform hinterlegt.".to_string());
    }

    #[cfg(target_os = "macos")]
    {
        let tmp_dmg = "/tmp/eren-struktogrammer-update.dmg";
        let mount_point = "/tmp/eren-struktogrammer-mount";

        let dl = Command::new("curl")
            .args(["-fsSL", "-o", tmp_dmg, &download_url])
            .status()
            .map_err(|e| format!("Download fehlgeschlagen: {e}"))?;
        if !dl.success() {
            return Err("Update-Paket konnte nicht heruntergeladen werden.".to_string());
        }

        let _ = Command::new("hdiutil")
            .args(["detach", mount_point, "-quiet"])
            .status();

        let attach = Command::new("hdiutil")
            .args([
                "attach",
                tmp_dmg,
                "-mountpoint",
                mount_point,
                "-nobrowse",
                "-quiet",
            ])
            .status()
            .map_err(|e| format!("Mounten fehlgeschlagen: {e}"))?;
        if !attach.success() {
            return Err("DMG-Image konnte nicht geöffnet werden.".to_string());
        }

        let src_app = format!("{mount_point}/Eren Struktogrammer.app");
        let dst_app = "/Applications/Eren Struktogrammer.app";

        let _ = Command::new("rm").args(["-rf", dst_app]).status();
        let copy = Command::new("cp")
            .args(["-R", &src_app, dst_app])
            .status()
            .map_err(|e| format!("Kopieren fehlgeschlagen: {e}"))?;

        let _ = Command::new("hdiutil")
            .args(["detach", mount_point, "-quiet"])
            .status();
        let _ = std::fs::remove_file(tmp_dmg);

        if !copy.success() {
            return Err("App konnte nicht nach /Applications installiert werden.".to_string());
        }

        let _ = Command::new("open").args(["-n", dst_app]).spawn();
        std::process::exit(0);
    }

    #[cfg(target_os = "windows")]
    {
        let tmp_exe = std::env::temp_dir().join("Eren-Struktogrammer-Update.exe");
        let tmp_str = tmp_exe.to_string_lossy().to_string();
        let dl = Command::new("curl")
            .args(["-fsSL", "-o", &tmp_str, &download_url])
            .status()
            .map_err(|e| format!("Download fehlgeschlagen: {e}"))?;
        if !dl.success() {
            return Err("Installer konnte nicht heruntergeladen werden.".to_string());
        }
        Command::new(&tmp_exe)
            .spawn()
            .map_err(|e| format!("Installer konnte nicht gestartet werden: {e}"))?;
        std::process::exit(0);
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        Ok("Bitte lade die aktuelle Version über Hilfe -> Download herunter.".to_string())
    }
}

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
        .invoke_handler(tauri::generate_handler![
            check_app_update,
            install_app_update,
            read_file_by_path
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
