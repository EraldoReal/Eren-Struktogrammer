import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Calendar, Clock, Play } from 'lucide-react';
import { BLOG_POSTS, getBlogPostBySlug, type BlogPost } from '../data/blogPosts';
import { renderDiagramToSvgString } from '../engine/svgExport';
import { createDefaultStyle } from '../model/defaults';
import { serializeStruktogramm } from '../model/serializer';
import { useEditorStore } from '../store/editorStore';

const GITHUB_REPO_URL = 'https://github.com/EraldoReal/Eren-Struktogrammer';

export interface BlogPageProps {
  slug?: string;
  onNavigate: (path: string) => void;
  onLaunchEditor: () => void;
  onOpenImprint: () => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({
  slug,
  onNavigate,
  onLaunchEditor,
  onOpenImprint,
}) => {
  const language = useEditorStore((s) => s.appSettings.language);
  const updateAppSettings = useEditorStore((s) => s.updateAppSettings);
  const openDiagramFromContent = useEditorStore((s) => s.openDiagramFromContent);
  const isDe = language === 'de';

  const [categoryFilter, setCategoryFilter] = useState<'all' | BlogPost['category']>('all');
  const post = slug ? getBlogPostBySlug(slug) : undefined;

  const basePath = isDe ? '/blog' : '/en/blog';

  useEffect(() => {
    if (post) {
      document.title = isDe ? post.metaTitleDe : post.metaTitleEn;
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) {
        descEl.setAttribute('content', isDe ? post.metaDescriptionDe : post.metaDescriptionEn);
      }
    } else {
      document.title = isDe
        ? 'Struktogramm-Blog & Ratgeber (DIN 66261) | Eren Struktogrammer'
        : 'Structogram Blog & Guides (DIN 66261) | Eren Struktogrammer';
      const descEl = document.querySelector('meta[name="description"]');
      if (descEl) {
        descEl.setAttribute(
          'content',
          isDe
            ? 'Anleitungen, Beispiele, Vergleiche (HuS & Nassi-Editoren) sowie Abitur-Tipps rund um Struktogramme nach DIN 66261.'
            : 'Step-by-step guides, comparisons, and exam tips for DIN 66261 Nassi-Shneiderman structograms.',
        );
      }
    }
    window.scrollTo({ top: 0 });
  }, [post, isDe]);

  const exampleSvg = useMemo(() => {
    if (!post?.exampleDiagram) return null;
    return renderDiagramToSvgString(post.exampleDiagram, createDefaultStyle(), {
      transparent: false,
      padding: 16,
    });
  }, [post]);

  const handleOpenExampleInEditor = () => {
    if (!post?.exampleDiagram) return;
    const raw = serializeStruktogramm(post.exampleDiagram);
    openDiagramFromContent(raw);
    onLaunchEditor();
  };

  const handleSwitchLanguage = (nextLang: 'de' | 'en') => {
    updateAppSettings({ language: nextLang });
    if (post) {
      onNavigate(nextLang === 'de' ? `/blog/${post.slug}` : `/en/blog/${post.slug}`);
    } else {
      onNavigate(nextLang === 'de' ? '/blog' : '/en/blog');
    }
  };

  const filteredPosts =
    categoryFilter === 'all'
      ? BLOG_POSTS
      : BLOG_POSTS.filter((p) => p.category === categoryFilter);

  const sections = post ? (isDe ? post.sectionsDe : post.sectionsEn) : [];
  const relatedPosts = post
    ? BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3)
    : [];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-300 bg-white/95 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate(post ? basePath : isDe ? '/' : '/en')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>
                {post
                  ? isDe
                    ? 'Alle Beiträge'
                    : 'All Posts'
                  : isDe
                    ? 'Startseite'
                    : 'Home'}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => handleSwitchLanguage('de')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  isDe ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                DE
              </button>
              <button
                type="button"
                onClick={() => handleSwitchLanguage('en')}
                className={`px-2 py-1 rounded cursor-pointer ${
                  !isDe ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onLaunchEditor}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              <span>{isDe ? 'Editor öffnen' : 'Open Editor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {!post ? (
          <>
            <section className="bg-white border border-slate-300 rounded-lg p-6 shadow-xs space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{isDe ? 'Ratgeber & Vergleiche' : 'Guides & Comparisons'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                {isDe
                  ? 'Struktogramm-Blog: Anleitungen, Beispiele & Vergleiche'
                  : 'Structogram Blog: Tutorials, Examples & Comparisons'}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-3xl">
                {isDe
                  ? 'Schritt-für-Schritt-Anleitungen nach DIN 66261, Vergleiche mit klassischen Nassi-Editoren und dem HuS Struktogrammer sowie direkte Beispiel-Diagramme zum Ausprobieren.'
                  : 'Step-by-step DIN 66261 tutorials, honest comparisons with classic Nassi editors and HuS Struktogrammer, plus interactive diagrams ready to open in the editor.'}
              </p>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(
                  [
                    { id: 'all', de: 'Alle Beiträge', en: 'All Posts' },
                    { id: 'guide', de: 'Anleitungen & Beispiele', en: 'Guides & Examples' },
                    { id: 'comparison', de: 'Vergleiche', en: 'Comparisons' },
                    { id: 'exam', de: 'Prüfung & Theorie', en: 'Exams & Theory' },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium border cursor-pointer transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {isDe ? cat.de : cat.en}
                  </button>
                ))}
              </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPosts.map((item) => (
                <a
                  key={item.slug}
                  href={`${basePath}/${item.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(`${basePath}/${item.slug}`);
                  }}
                  className="group bg-white border border-slate-300 hover:border-blue-500 rounded-lg p-5 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                        {isDe ? item.categoryDe : item.categoryEn}
                      </span>
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3.5 h-3.5" />
                        {item.readTimeMin} min
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      {isDe ? item.titleDe : item.titleEn}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {isDe ? item.excerptDe : item.excerptEn}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-xs font-semibold text-blue-600 pt-1">
                    <span>{isDe ? 'Beitrag lesen' : 'Read article'}</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </a>
              ))}
            </section>
          </>
        ) : (
          <article className="bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs space-y-6">
            {/* Breadcrumb & Meta */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <a
                  href={isDe ? '/' : '/en'}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(isDe ? '/' : '/en');
                  }}
                  className="hover:text-slate-900 underline underline-offset-2"
                >
                  {isDe ? 'Startseite' : 'Home'}
                </a>
                <span>/</span>
                <a
                  href={basePath}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(basePath);
                  }}
                  className="hover:text-slate-900 underline underline-offset-2"
                >
                  Blog
                </a>
                <span>/</span>
                <span className="text-slate-700 font-medium">
                  {isDe ? post.categoryDe : post.categoryEn}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                {isDe ? post.titleDe : post.titleEn}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {post.date}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {post.readTimeMin} {isDe ? 'Min. Lesezeit' : 'min read'}
                </span>
              </div>
            </div>

            <hr className="border-slate-200" />

            {/* Article Sections */}
            <div className="space-y-6">
              {sections.map((sec) => (
                <section key={sec.heading} className="space-y-3">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {sec.heading}
                  </h2>
                  {sec.paragraphs.map((p, idx) => (
                    <p key={idx} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {sec.bullets && (
                    <ul className="list-disc pl-5 space-y-1.5 text-sm sm:text-base text-slate-700">
                      {sec.bullets.map((b, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  {sec.table && (
                    <div className="overflow-x-auto rounded-lg border border-slate-200">
                      <table className="w-full text-left border-collapse text-xs sm:text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            {sec.table.headers.map((h) => (
                              <th key={h} className="px-3.5 py-2.5 font-semibold text-slate-900">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {sec.table.rows.map((row, rIdx) => (
                            <tr key={rIdx} className="hover:bg-slate-50/60">
                              {row.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  className={`px-3.5 py-2.5 ${
                                    cIdx === 0 ? 'font-medium text-slate-900' : 'text-slate-700'
                                  }`}
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              ))}
            </div>

            {/* Live Example Diagram */}
            {exampleSvg && post.exampleDiagram && (
              <section className="rounded-lg border border-blue-200 bg-blue-50/40 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      {isDe ? 'Live-Beispiel (DIN 66261)' : 'Live Example (DIN 66261)'}
                    </h3>
                    <p className="text-xs text-slate-600">
                      {isDe
                        ? 'Direkt gerendertes Struktogramm — mit einem Klick im Editor bearbeitbar.'
                        : 'Rendered directly in DIN 66261 — click to open and edit in the workspace.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleOpenExampleInEditor}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white cursor-pointer shrink-0"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>
                      {isDe ? 'Beispiel im Editor öffnen' : 'Open Example in Editor'}
                    </span>
                  </button>
                </div>
                <div
                  className="bg-white rounded-md border border-slate-200 p-3 overflow-x-auto flex justify-center"
                  dangerouslySetInnerHTML={{ __html: exampleSvg }}
                />
              </section>
            )}

            {/* Related Articles */}
            <hr className="border-slate-200" />
            <section className="space-y-3">
              <h3 className="text-base font-bold text-slate-900">
                {isDe ? 'Weitere Artikel im Blog' : 'More Articles'}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedPosts.map((rel) => (
                  <a
                    key={rel.slug}
                    href={`${basePath}/${rel.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`${basePath}/${rel.slug}`);
                    }}
                    className="p-3.5 rounded-md border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-white transition-all space-y-1"
                  >
                    <div className="text-[11px] font-medium text-blue-600">
                      {isDe ? rel.categoryDe : rel.categoryEn}
                    </div>
                    <div className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                      {isDe ? rel.titleDe : rel.titleEn}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </article>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-300 bg-white mt-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>Eren Struktogrammer · DIN 66261 Editor</span>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={isDe ? '/' : '/en'}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(isDe ? '/' : '/en');
              }}
              className="hover:text-slate-900 underline underline-offset-4"
            >
              {isDe ? 'Startseite' : 'Home'}
            </a>
            <a
              href={basePath}
              onClick={(e) => {
                e.preventDefault();
                onNavigate(basePath);
              }}
              className="hover:text-slate-900 underline underline-offset-4"
            >
              Blog
            </a>
            <a
              href="/din-66261"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/din-66261');
              }}
              className="hover:text-slate-900 underline underline-offset-4"
            >
              DIN 66261
            </a>
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-900 underline underline-offset-4"
            >
              GitHub
            </a>
            <button
              type="button"
              onClick={onOpenImprint}
              className="hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              {isDe ? 'Impressum & Datenschutz' : 'Imprint & Privacy'}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
