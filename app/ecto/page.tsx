import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import BlogNav from '@/components/BlogNav';
import Footer from '@/components/Footer';
import { ectoRelease, ectoReleaseNotes } from '@/lib/ecto-release';

const screenshot = '/images/blog/ecto-agent-control-plane-ghostty/ecto.png';
const socialCard = '/images/ecto/ecto-social-card.webp';

export const metadata: Metadata = {
  title: 'Ecto — a native terminal workspace for coding agents',
  description:
    'Download Ecto, a pre-alpha native terminal workspace for coding agents built in Rust on GPUI with libghostty-vt. macOS universal DMG; Linux and Windows previews.',
  alternates: {
    canonical: '/ecto',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'Bruce Lim',
    title: 'Ecto — a native terminal workspace for coding agents',
    description:
      'A pre-alpha terminal workspace for running coding agents side by side. macOS universal DMG; Linux and Windows previews.',
    url: 'https://brucelim.com/ecto',
    images: [
      {
        url: socialCard,
        width: 1200,
        height: 628,
        alt: 'Ecto, a native terminal workspace for coding agents',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ecto — a native terminal workspace for coding agents',
    description:
      'A pre-alpha terminal workspace for running coding agents side by side. macOS universal DMG; Linux and Windows previews.',
    images: [socialCard],
  },
};

const platformList = [
  ectoRelease.platforms.macos,
  ectoRelease.platforms.linux,
  ectoRelease.platforms.windows,
];

const wrapClass =
  'mx-auto w-full max-w-[1040px] px-[clamp(20px,4vw,32px)]';

const sectionHeadClass =
  'mb-[clamp(24px,4vw,36px)] flex items-end justify-between gap-8 max-[900px]:flex-col max-[900px]:items-start max-[900px]:gap-[18px]';

const kickerClass =
  'mb-3 block text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.45)]';

const sectionTitleClass =
  'text-[clamp(32px,5vw,56px)] font-semibold leading-none tracking-[-0.045em]';

const sectionLedeClass =
  'mt-5 max-w-[460px] text-[14px] leading-[1.65] text-[rgba(255,255,255,0.52)]';

const featuresLedeClass =
  'max-w-[340px] text-right text-[14px] leading-[1.65] text-[rgba(255,255,255,0.52)] max-[900px]:max-w-[460px] max-[900px]:text-left';

const installLedeClass =
  'max-w-[380px] text-right text-[14px] leading-[1.65] text-[rgba(255,255,255,0.52)] max-[900px]:max-w-[460px] max-[900px]:text-left';

const heroDownloadClass =
  'inline-flex items-center gap-4 border border-transparent bg-[var(--ecto-mint)] px-5 py-3 text-[#04201c] no-underline transition-[filter] duration-300 ease-[ease] hover:brightness-[1.08] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-white motion-reduce:transition-none';

const secondaryCtaClass =
  'inline-flex items-center gap-[10px] border border-[rgba(255,255,255,0.18)] px-4 py-[13px] text-[12px] font-semibold uppercase tracking-[0.1em] text-[rgba(255,255,255,0.85)] no-underline transition-[border-color,background] duration-300 ease-[ease] hover:border-[rgba(255,255,255,0.4)] hover:bg-[rgba(255,255,255,0.04)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--ecto-mint)] motion-reduce:transition-none';

const ctaArrowClass = 'text-[14px] leading-none';

const downloadCardClass = (primary: boolean) =>
  `flex min-w-0 flex-col border p-[22px] max-sm:p-[18px] ${
    primary
      ? 'border-[rgba(94,234,212,0.34)] [background:linear-gradient(180deg,rgba(94,234,212,0.075),rgba(255,255,255,0.02)_45%)]'
      : 'border-[var(--ecto-line)] bg-[rgba(255,255,255,0.022)]'
  }`;

const badgeClass = (primary: boolean) =>
  `flex-none whitespace-nowrap border px-[7px] py-[5px] text-[9px] font-bold uppercase tracking-[0.1em] ${
    primary
      ? 'border-[rgba(94,234,212,0.36)] bg-[rgba(94,234,212,0.08)] text-[var(--ecto-mint-soft)]'
      : 'border-[rgba(255,255,255,0.18)] text-[rgba(255,255,255,0.55)]'
  }`;

const featureColumnClass =
  'border border-[var(--ecto-line)] bg-[rgba(255,255,255,0.02)] p-6 max-sm:p-5';

const plannedColumnClass =
  'border border-[var(--ecto-line-soft)] bg-[rgba(255,255,255,0.01)] p-6 max-sm:p-5';

const columnHeadClass =
  'flex items-center gap-[10px] text-[11px] font-bold uppercase tracking-[0.14em] text-[rgba(255,255,255,0.78)]';

const activeDotClass =
  'size-[7px] rounded-full bg-[var(--ecto-mint)] shadow-[0_0_10px_rgba(94,234,212,0.7)]';

const columnNoteClass =
  'ml-[17px] mt-[7px] text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.36)]';

const featureListClass = 'mt-5 flex list-none flex-col gap-[18px]';

const featureListItemClass =
  'border-t border-[var(--ecto-line-soft)] pt-[18px] first:border-t-0 first:pt-0';

const monoClass = 'font-[family-name:var(--ecto-mono)]';

const codeBlockClass = `mb-[14px] overflow-x-auto border border-[rgba(255,255,255,0.09)] bg-[#0a0a0a] px-3 py-[11px] ${monoClass} text-[11px] leading-[1.65] text-[#c8ffe9]`;

const stepCodeClass = `bg-[rgba(94,234,212,0.08)] px-1 py-px ${monoClass} text-[11px] text-[var(--ecto-mint-soft)]`;

const stepLabelClass =
  'mb-[7px] mt-[18px] text-[10px] font-semibold uppercase tracking-[0.11em] text-[rgba(255,255,255,0.38)]';

export default function EctoPage() {
  return (
    <div className="home-v2 flex min-h-screen flex-col [--ecto-faint:rgba(255,255,255,0.36)] [--ecto-line-soft:rgba(255,255,255,0.08)] [--ecto-line:rgba(255,255,255,0.12)] [--ecto-mint-soft:#b9ffe4] [--ecto-mint:#5eead4] [--ecto-mono:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation_Mono',monospace]">
      <BlogNav />
      <main className="w-full flex-grow">
        <section className="relative overflow-hidden border-b border-[var(--ecto-line-soft)] pb-[clamp(48px,7vw,80px)] pt-[clamp(56px,8vw,96px)] before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(680px_360px_at_82%_18%,rgba(94,234,212,0.09),transparent_70%),radial-gradient(520px_300px_at_5%_80%,rgba(132,205,250,0.05),transparent_70%)] before:content-['']">
          <div className={`relative z-[1] ${wrapClass}`}>
            <div className="mb-[clamp(32px,5vw,52px)] flex items-center justify-between gap-4 max-sm:mb-[30px] max-sm:flex-wrap">
              <span className="inline-flex items-center gap-[10px] text-[11px] font-semibold uppercase tracking-[0.16em] text-[rgba(255,255,255,0.62)]">
                <Image
                  src="/images/ecto/ecto-app-icon.png"
                  width={26}
                  height={26}
                  alt=""
                  className="rounded-[5px]"
                  priority
                />
                ecto
              </span>
              <span className="inline-flex flex-none items-center gap-2 border border-[rgba(94,234,212,0.32)] bg-[rgba(94,234,212,0.06)] px-[10px] py-[7px] text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ecto-mint-soft)]">
                <span
                  className="size-1.5 rounded-full bg-[var(--ecto-mint)] shadow-[0_0_10px_rgba(94,234,212,0.8)]"
                  aria-hidden="true"
                />
                Built on Ghostty
              </span>
            </div>

            <div className="grid grid-cols-[minmax(0,1fr)_260px] items-center gap-[clamp(32px,5vw,72px)] max-[900px]:grid-cols-1">
              <div>
                <h1 className="max-w-[780px] text-[clamp(44px,7.2vw,88px)] font-semibold leading-[0.95] tracking-[-0.055em] max-sm:text-[clamp(40px,12vw,58px)]">
                  A terminal workspace for{' '}
                  <span className="hv-grad-text pb-[0.12em] -mb-[0.12em]">coding agents.</span>
                </h1>
                <p className="mt-[clamp(20px,3vw,28px)] max-w-[640px] text-[clamp(16px,1.8vw,19px)] leading-[1.6] text-[rgba(255,255,255,0.64)]">
                  Run Claude Code, Codex, opencode, pi and other coding agents
                  side by side in shells, tabs and split panes. See which one
                  needs you, and pick the workspace back up where you left it.
                </p>
                <p className="mt-[18px] text-[11px] font-medium uppercase tracking-[0.16em] text-[rgba(255,255,255,0.4)]">
                  Rust on GPUI, with libghostty-vt as the terminal core.
                </p>

                <div className="mt-[clamp(26px,4vw,36px)] flex flex-wrap gap-[10px]">
                  <a className={heroDownloadClass} href="#downloads">
                    <span className="flex flex-col gap-[3px] text-left">
                      <span className="text-[13px] font-bold uppercase tracking-[0.1em]">
                        Download Ecto
                      </span>
                      <span className="text-[10.5px] font-medium tracking-[0.02em] opacity-70">
                        {ectoRelease.version} · macOS · Linux · Windows
                      </span>
                    </span>
                    <span className="border-l border-[rgba(4,32,28,0.25)] pl-4 text-[18px] leading-none" aria-hidden="true">↓</span>
                  </a>
                  <Link className={secondaryCtaClass} href="/ecto/docs">
                    Getting started
                    <span className={ctaArrowClass} aria-hidden="true">→</span>
                  </Link>
                </div>

              </div>

              <div
                className="relative flex aspect-square flex-col items-center justify-center gap-[14px] border border-[rgba(255,255,255,0.1)] [background:radial-gradient(circle_at_50%_42%,rgba(94,234,212,0.14),transparent_68%),rgba(255,255,255,0.018)] before:pointer-events-none before:absolute before:inset-[10px] before:border before:border-[rgba(255,255,255,0.06)] before:content-[''] max-[900px]:hidden"
                aria-hidden="true"
              >
                <Image
                  src="/images/ecto/ecto-app-icon.png"
                  width={256}
                  height={256}
                  alt=""
                  className="h-auto w-[62%] rounded-[22%] shadow-[0_24px_60px_rgba(0,0,0,0.5)]"
                  priority
                />
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-[rgba(255,255,255,0.38)]">Pre-alpha / {ectoRelease.version}</span>
              </div>
            </div>
          </div>
        </section>

        <section
          className="border-b border-[var(--ecto-line-soft)] py-[clamp(48px,7vw,80px)]"
          aria-label="Ecto workspace screenshot"
        >
          <div className={wrapClass}>
            <div className="overflow-hidden border border-[var(--ecto-line)] bg-[#050505]">
              <Image
                src={screenshot}
                alt="Ecto with Claude Code, Codex and opencode running side by side in separate panes"
                width={2032}
                height={1192}
                sizes="(max-width: 1040px) 100vw, 1040px"
                className="block h-auto w-full"
              />
            </div>
            <div className="mt-[10px] flex justify-between gap-5 text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.34)] max-sm:flex-col max-sm:gap-[5px]">
              <span>
                Claude Code, Codex and opencode in one Ecto workspace.
              </span>
              <span>Pre-alpha build</span>
            </div>
          </div>
        </section>

        <section
          id="downloads"
          className="border-b border-[var(--ecto-line-soft)] py-[clamp(56px,8vw,96px)]"
          aria-labelledby="downloads-title"
        >
          <div className={wrapClass}>
            <div className={sectionHeadClass}>
              <div>
                <span className={kickerClass}>Downloads</span>
                <h2 id="downloads-title" className={sectionTitleClass}>
                  Get Ecto.
                </h2>
              </div>
              <div className="flex flex-none flex-col items-end gap-1 text-right text-[11px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.38)] max-[900px]:items-start max-[900px]:text-left">
                <span>Version</span>
                <strong className="text-[18px] font-semibold normal-case tracking-[-0.01em] text-[rgba(255,255,255,0.9)]">{ectoRelease.version}</strong>
              </div>
            </div>

            <div className="grid grid-cols-[1.08fr_1fr_1fr] items-stretch gap-[14px] max-[900px]:grid-cols-1">
              {platformList.map((platform, index) => (
                <article
                  key={platform.name}
                  className={downloadCardClass(index === 0)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-[26px] font-semibold leading-none tracking-[-0.03em]">{platform.name}</h3>
                      <p className="mt-[6px] text-[11px] leading-[1.4] text-[rgba(255,255,255,0.45)]">{platform.target}</p>
                    </div>
                    <span className={badgeClass(index === 0)}>
                      {platform.status}
                    </span>
                  </div>

                  <p className="mt-5 text-[10px] uppercase tracking-[0.14em] text-[rgba(255,255,255,0.38)]">
                    Version <strong className="font-semibold text-[rgba(255,255,255,0.82)]">{platform.version}</strong>
                  </p>

                  <div className="mt-2">
                    {platform.assets.map((asset) => (
                      <div className="mt-[14px] border-t border-[rgba(255,255,255,0.09)] pt-[14px]" key={asset.file}>
                        <div className="flex justify-between gap-[10px] text-[11px] text-[rgba(255,255,255,0.55)]">
                          <span>{asset.label}</span>
                        </div>
                        <code className={`mt-[5px] block [overflow-wrap:anywhere] ${monoClass} text-[10.5px] leading-[1.45] text-[rgba(255,255,255,0.42)]`}>{asset.file}</code>
                        <div className="mt-[10px] flex items-center gap-[14px] max-sm:flex-wrap max-sm:gap-x-[14px] max-sm:gap-y-[10px]">
                          <a
                            className="inline-flex items-center gap-2 bg-[#f5f5f5] px-[11px] py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#0a0a0a] no-underline hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-[var(--ecto-mint)]"
                            href={ectoRelease.releasesUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`View ${asset.label} downloads for ${platform.name} on GitHub Releases`}
                          >
                            View downloads
                            <span aria-hidden="true">↓</span>
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-4 border-t border-[var(--ecto-line-soft)] pt-[14px] text-[11px] leading-[1.5] text-[rgba(255,255,255,0.42)]">{platform.note}</p>

                  <div className="mt-auto pt-5">
                    <a
                      className="inline-flex gap-[6px] text-[11px] font-semibold tracking-[0.06em] text-[var(--ecto-mint-soft)] no-underline hover:text-white"
                      href={ectoRelease.notesUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Read Ecto release notes on GitHub"
                    >
                      Release notes
                      <span aria-hidden="true">↗</span>
                    </a>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-[18px] flex flex-wrap justify-between gap-4 border-t border-[var(--ecto-line-soft)] pt-[14px] text-[11px] text-[rgba(255,255,255,0.4)]">
              <span>
                <a
                  className="border-b border-[rgba(255,255,255,0.2)] text-[rgba(255,255,255,0.72)] no-underline hover:border-white hover:text-white"
                  href={ectoRelease.releasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  All releases
                  <span aria-hidden="true"> ↗</span>
                </a>
              </span>
              <span>Downloads, release notes and SHA-256 checksums are on GitHub Releases.</span>
            </div>
          </div>
        </section>

        <section
          className="border-b border-[var(--ecto-line-soft)] py-[clamp(56px,8vw,96px)]"
          aria-labelledby="release-notes-title"
        >
          <div className={wrapClass}>
            <div className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] items-start gap-[clamp(32px,6vw,80px)] max-[900px]:grid-cols-1">
              <div>
                <span className={kickerClass}>Release notes</span>
                <h2 id="release-notes-title" className={sectionTitleClass}>
                  What&rsquo;s in {ectoRelease.version}
                </h2>
                <p className={sectionLedeClass}>
                  What the current build includes. It is still pre-alpha: 0.x
                  releases can change the config, session format and control
                  protocol.
                </p>
                <a
                  className="mt-5 inline-flex gap-[6px] border-b border-[rgba(94,234,212,0.35)] pb-[3px] text-[12px] font-semibold text-[var(--ecto-mint-soft)] no-underline hover:border-white hover:text-white"
                  href={ectoRelease.notesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Release notes on GitHub
                  <span aria-hidden="true"> ↗</span>
                </a>
              </div>
              <ul className="list-none border-t border-[var(--ecto-line)]">
                {ectoReleaseNotes.map((note) => (
                  <li
                    className="relative border-b border-[var(--ecto-line-soft)] py-[13px] pl-[22px] text-[13px] leading-[1.55] text-[rgba(255,255,255,0.68)] before:absolute before:left-[2px] before:top-[21px] before:size-[5px] before:bg-[var(--ecto-mint)] before:shadow-[0_0_8px_rgba(94,234,212,0.6)] before:content-['']"
                    key={note}
                  >
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section
          className="border-b border-[var(--ecto-line-soft)] py-[clamp(56px,8vw,96px)]"
          aria-labelledby="features-title"
        >
          <div className={wrapClass}>
            <div className={sectionHeadClass}>
              <div>
                <span className={kickerClass}>Features</span>
                <h2 id="features-title" className={sectionTitleClass}>
                  What works now.
                </h2>
              </div>
              <p className={featuresLedeClass}>
                What is in the download, what I&rsquo;m building next, and what is
                still planned.
              </p>
            </div>

            <div className="mb-[14px]">
              <div className="overflow-hidden border border-[var(--ecto-line)] bg-[#050505]">
                <Image
                  src="/images/ecto/generated/ecto-workspace-evolution.webp"
                  alt="Illustration of an Ecto workspace with a file tree, terminal panes, an image grid and an editor"
                  width={1376}
                  height={768}
                  sizes="(max-width: 1040px) 100vw, 1040px"
                  className="block h-auto w-full"
                />
              </div>
              <p className="mt-[10px] text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.34)]">
                Illustration of the workspace in development.
              </p>
            </div>

            <div className="grid grid-cols-[1.05fr_1fr_1fr] gap-[14px] max-[900px]:grid-cols-1">
              <div className={featureColumnClass}>
                <h3 className={columnHeadClass}>
                  <span className={activeDotClass} aria-hidden="true" />
                  In this build
                </h3>
                <p className={columnNoteClass}>Public download</p>
                <ul className={featureListClass}>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Native terminal</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Rust and GPUI with libghostty-vt 1.0: tabs, splits, pane zoom,
                      themes, terminal search, a command palette and SSH.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Session restore</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Restore windows, tabs, splits, names and terminal
                      scrollback. Ecto also tries to resume agent conversations;
                      support depends on the harness and saved session.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Pane control</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Named panes, agent identity, and a CLI/MCP surface to inspect,
                      read, split, open tabs and send input. Agents can use it when you direct them.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Supervision</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Agent status indicators in pane headers, tabs and the sidebar,
                      plus runtime diagnostics.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Linux and Windows previews</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Preview builds for x86_64 Linux and Windows x64. Native GUI
                      acceptance is still pending on both.
                    </span>
                  </li>
                </ul>
              </div>

              <div className={featureColumnClass}>
                <h3 className={columnHeadClass}>
                  <span className={activeDotClass} aria-hidden="true" />
                  In development
                </h3>
                <p className={columnNoteClass}>Working in my build, not in the download</p>
                <ul className={featureListClass}>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Sidebar file tree</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      A Files view rooted on the focused pane&rsquo;s working
                      directory, with lazy expansion and a manual refresh.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Media panel</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Single-image and thumbnail views docked beside the terminal.
                      One panel per window; content is not restored.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Text editor</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Opens a file as a pane with syntax highlighting, find and
                      replace, and save. It is an editor, not a full IDE.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Browser pane</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      A macOS-only first cut, opened from the palette. One page per
                      pane; pages do not restore with the session.
                    </span>
                  </li>
                </ul>
              </div>

              <div className={plannedColumnClass}>
                <h3 className={columnHeadClass}>
                  <span className="size-[7px] rounded-full border border-[rgba(255,255,255,0.35)]" aria-hidden="true" />
                  Still planned
                </h3>
                <p className={columnNoteClass}>Direction, not shipped</p>
                <ul className={featureListClass}>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Automated coordination</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Agents handing work to each other without you relaying it.
                      Direction, not a shipped feature.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Shared space</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      A per-project place for notes and handoffs between agents.
                      Planned, not in this build.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Browser follow-through</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Session restore, terminal link routing, and Linux and Windows
                      support for the browser pane.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Platform parity</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Linux and Windows remain previews; native GUI acceptance is
                      still pending on both.
                    </span>
                  </li>
                  <li className={featureListItemClass}>
                    <strong className="block text-[14px] font-semibold text-[rgba(255,255,255,0.9)]">Packaging</strong>
                    <span className="mt-1 block text-[13px] leading-[1.55] text-[rgba(255,255,255,0.5)]">
                      Developer ID signing and notarization, installers and automatic
                      updates.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section
          id="install"
          className="border-b border-[var(--ecto-line-soft)] py-[clamp(56px,8vw,96px)]"
          aria-labelledby="install-title"
        >
          <div className={wrapClass}>
            <div className={sectionHeadClass}>
              <div>
                <span className={kickerClass}>Install</span>
                <h2 id="install-title" className={sectionTitleClass}>
                  Run {ectoRelease.version}.
                </h2>
              </div>
              <p className={installLedeClass}>
                Keep the app and its bundled CLI together. The macOS build is the
                primary one; Linux and Windows are previews.
              </p>
            </div>

            <div className="grid grid-cols-[1fr_1.15fr_1fr] items-start gap-[14px] max-[900px]:grid-cols-1">
              <article className="min-w-0 border-t border-[rgba(255,255,255,0.16)] pt-[18px]">
                <div className="flex items-center justify-between gap-[10px]">
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">macOS</h3>
                  <span className={badgeClass(true)}>Primary</span>
                </div>
                <ol className="mt-4 pl-[18px] text-[12.5px] leading-[1.6] text-[rgba(255,255,255,0.58)]">
                  <li className="mb-[9px] pl-[2px]">
                    Open <code className={stepCodeClass}>Ecto-0.1.0.dmg</code> and drag Ecto to Applications.
                  </li>
                  <li className="mb-[9px] pl-[2px]">
                    The app is ad-hoc signed and not notarized, so macOS blocks
                    the first launch. Open System Settings → Privacy &amp;
                    Security and choose <strong>Open Anyway</strong>.
                  </li>
                  <li className="mb-[9px] pl-[2px]">
                    Optional: run <strong>Install ecto command</strong> from the
                    command palette to put the bundled CLI on your PATH.
                  </li>
                </ol>
                <p className="mt-4 border-t border-dashed border-[rgba(255,255,255,0.1)] pt-3 text-[12px] leading-[1.55] text-[rgba(255,255,255,0.45)]">
                  <strong className="text-[rgba(255,255,255,0.66)]">Requires:</strong> macOS on Apple Silicon or Intel. The DMG
                  is universal; no Rust, Zig or build tools are needed.
                </p>
              </article>

              <article className="min-w-0 border-t border-[rgba(255,255,255,0.16)] pt-[18px]">
                <div className="flex items-center justify-between gap-[10px]">
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">Linux</h3>
                  <span className={badgeClass(false)}>Preview</span>
                </div>
                <p className={stepLabelClass}>Debian / Ubuntu</p>
                <pre className={codeBlockClass}>
                  <code>{`sha256sum --check ecto_0.1.0-1_amd64.deb.sha256
sudo apt install ./ecto_0.1.0-1_amd64.deb`}</code>
                </pre>
                <p className={stepLabelClass}>Portable tarball</p>
                <pre className={codeBlockClass}>
                  <code>{`sha256sum --check ecto-0.1.0-linux-x86_64.tar.gz.sha256
tar -xzf ecto-0.1.0-linux-x86_64.tar.gz
cd ecto-0.1.0-linux-x86_64
./bin/ecto`}</code>
                </pre>
                <p className="mt-4 border-t border-dashed border-[rgba(255,255,255,0.1)] pt-3 text-[12px] leading-[1.55] text-[rgba(255,255,255,0.45)]">
                  <strong className="text-[rgba(255,255,255,0.66)]">Requires:</strong> 64-bit x86 Linux, glibc 2.35+, Wayland or
                  X11, and system graphics drivers. The .deb targets Ubuntu 22.04 and
                  24.04; the tarball installs nothing system-wide.
                </p>
              </article>

              <article className="min-w-0 border-t border-[rgba(255,255,255,0.16)] pt-[18px]">
                <div className="flex items-center justify-between gap-[10px]">
                  <h3 className="text-[22px] font-semibold tracking-[-0.02em]">Windows</h3>
                  <span className={badgeClass(false)}>Preview</span>
                </div>
                <p className={stepLabelClass}>Verify the ZIP</p>
                <pre className={codeBlockClass}>
                  <code>{`Get-FileHash .\\Ecto-0.1.0-windows-x64.zip \`
  -Algorithm SHA256`}</code>
                </pre>
                <ol className="mt-4 pl-[18px] text-[12.5px] leading-[1.6] text-[rgba(255,255,255,0.58)]">
                  <li className="mb-[9px] pl-[2px]">
                    Extract the ZIP anywhere and run <code className={stepCodeClass}>ecto.exe</code>.
                  </li>
                  <li className="mb-[9px] pl-[2px]">
                    Use <code className={stepCodeClass}>ecto.com</code> for CLI output, pipes and exit codes.
                  </li>
                  <li className="mb-[9px] pl-[2px]">
                    SmartScreen may warn because the preview ZIP is unsigned. There
                    is no installer or auto-update.
                  </li>
                </ol>
                <p className="mt-4 border-t border-dashed border-[rgba(255,255,255,0.1)] pt-3 text-[12px] leading-[1.55] text-[rgba(255,255,255,0.45)]">
                  <strong className="text-[rgba(255,255,255,0.66)]">Requires:</strong> Windows 10 1809+ on x64. Native GUI
                  acceptance is still pending.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section
          className="pb-[clamp(40px,6vw,64px)] pt-[clamp(56px,8vw,96px)]"
          aria-labelledby="closing-title"
        >
          <div className={wrapClass}>
            <div className="flex items-end justify-between gap-8 border-t border-[var(--ecto-line)] pt-[clamp(24px,4vw,40px)] max-[900px]:flex-col max-[900px]:items-start">
              <div>
                <span className={kickerClass}>Built on Ghostty</span>
                <h2 id="closing-title" className="max-w-[620px] text-[clamp(30px,4.6vw,54px)] font-semibold leading-[1.03] tracking-[-0.045em] max-sm:text-[clamp(28px,8vw,40px)]">
                  A native room for the agents you already run.
                </h2>
              </div>
              <div className="flex flex-none flex-wrap gap-[10px] max-[900px]:flex-initial">
                <a className={heroDownloadClass} href="#downloads">
                  <span className="flex flex-col gap-[3px] text-left">
                    <span className="text-[13px] font-bold uppercase tracking-[0.1em]">
                      Download Ecto
                    </span>
                    <span className="text-[10.5px] font-medium tracking-[0.02em] opacity-70">
                      {ectoRelease.version} · macOS · Linux · Windows
                    </span>
                  </span>
                  <span className="border-l border-[rgba(4,32,28,0.25)] pl-4 text-[18px] leading-none" aria-hidden="true">↑</span>
                </a>
                <Link
                  className={secondaryCtaClass}
                  href="/blog/ecto-agent-control-plane-ghostty"
                >
                  Read the Ecto story
                  <span className={ctaArrowClass} aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
