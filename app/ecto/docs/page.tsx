import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import BlogNav from '@/components/BlogNav';
import Footer from '@/components/Footer';
import { ectoRelease } from '@/lib/ecto-release';

export const metadata: Metadata = {
  title: 'Getting started with Ecto',
  description: 'Install Ecto and start a terminal workspace for coding agents.',
  alternates: { canonical: '/ecto/docs' },
};

const section = 'scroll-mt-24 border-t border-[rgba(255,255,255,0.12)] py-10';
const heading = 'text-[clamp(25px,4vw,36px)] font-semibold tracking-[-0.035em] text-white';
const copy = 'mt-4 text-[15px] leading-[1.75] text-[rgba(255,255,255,0.65)]';
const link = 'text-[#b9ffe4] underline decoration-[rgba(94,234,212,0.4)] underline-offset-4 hover:text-white';
const code = 'mt-4 overflow-x-auto border border-[rgba(255,255,255,0.1)] bg-[#0a0a0a] p-4 font-mono text-[12px] leading-[1.7] text-[#c8ffe9]';

const shortcuts = [
  ['New tab', 'Cmd+T', 'Ctrl+Shift+T'],
  ['Previous / next tab', 'Ctrl+Shift+Tab / Ctrl+Tab', 'Ctrl+Shift+Tab / Ctrl+Tab'],
  ['Close pane', 'Cmd+W', 'Ctrl+Shift+W'],
  ['Split right', 'Cmd+D', 'Ctrl+Shift+D'],
  ['Split down', 'Cmd+Shift+D', 'Ctrl+Alt+Shift+D'],
  ['Focus adjacent pane', 'Cmd+Shift+Arrow', 'Ctrl+Shift+Arrow'],
  ['Zoom pane', 'Cmd+Shift+Enter', 'Ctrl+Shift+Enter'],
  ['Find', 'Cmd+F', 'Ctrl+Shift+F'],
  ['Find next / previous', 'Cmd+G / Cmd+Shift+G', 'Ctrl+Shift+G / Ctrl+Alt+Shift+G'],
  ['Command palette', 'Cmd+Shift+P', 'Ctrl+Shift+P'],
  ['Settings', 'Cmd+,', 'Ctrl+,'],
] as const;

const commands = [
  ['list', 'List panes and their state.'],
  ['read', 'Read a pane’s screen and scrollback.'],
  ['split', 'Split a target pane to the right or down.'],
  ['new-tab', 'Open a tab, optionally in a group or directory.'],
  ['focus', 'Focus a target pane.'],
  ['name', 'Set a pane name.'],
  ['prompt', 'Type text into a pane and press Return.'],
  ['paste', 'Send a bracketed paste from stdin or a file, then press Return.'],
  ['send-key', 'Send named keys or literal text to a pane.'],
  ['env', 'Show the caller’s Ecto context.'],
  ['identify', 'Identify the caller’s pane when possible.'],
] as const;

export default function EctoDocsPage() {
  return (
    <div className="home-v2 flex min-h-screen flex-col">
      <BlogNav />
      <main className="mx-auto w-full max-w-[840px] flex-grow px-[clamp(20px,4vw,32px)] pb-20 pt-[clamp(56px,8vw,96px)]">
        <Link href="/ecto" className={link}>← Ecto overview</Link>
        <p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#b9ffe4]">Ecto {ectoRelease.version} / Getting started</p>
        <h1 className="mt-4 text-[clamp(42px,7vw,70px)] font-semibold leading-none tracking-[-0.05em]">Your first workspace.</h1>
        <p className={`${copy} mb-10 max-w-[650px]`}>Install Ecto, open a shell, and arrange the agents and terminals you use together. This release is pre-alpha; macOS is the primary platform and Linux and Windows builds are previews.</p>

        <nav aria-label="Guide references" className="-mt-5 mb-10 flex flex-wrap gap-x-6 gap-y-3 text-[13px]">
          <a className={link} href="#keyboard-shortcuts">Keyboard shortcuts ↓</a>
          <a className={link} href="#cli-reference">CLI reference ↓</a>
        </nav>
        <figure className="mb-10">
          <div className="overflow-hidden border border-[rgba(255,255,255,0.12)] bg-[#050505]">
            <Image src="/images/ecto/docs/single-tab.png" alt="Ecto with a single Notes terminal tab and the sidebar hidden" width={1448} height={981} sizes="(max-width: 840px) 100vw, 840px" className="block h-auto w-full" />
          </div>
          <figcaption className="mt-[10px] text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.4)]">A single terminal tab with the sidebar hidden.</figcaption>
        </figure>

        <section className={section}>
          <h2 className={heading}>1. Download and install</h2>
          <p className={copy}>Get the package and matching SHA-256 checksum from <a className={link} href={ectoRelease.releasesUrl}>GitHub Releases</a>. Choose the package for your platform.</p>
          <h3 className="mt-7 text-lg font-semibold text-white">macOS · Apple silicon and Intel</h3>
          <p className={copy}>Open <code>{ectoRelease.platforms.macos.assets[0].file}</code> and drag Ecto to Applications. The app is ad-hoc signed and not notarized. If macOS blocks the first launch, open System Settings → Privacy &amp; Security and choose Open Anyway.</p>
          <h3 className="mt-7 text-lg font-semibold text-white">Linux · x86_64 preview</h3>
          <p className={copy}>On Ubuntu 22.04 or 24.04, verify the checksum and install the Debian package:</p>
          <pre className={code}><code>{`sha256sum --check ${ectoRelease.platforms.linux.assets[0].file}.sha256
sudo apt install ./${ectoRelease.platforms.linux.assets[0].file}
ecto`}</code></pre>
          <p className={copy}>Alternatively, extract the portable tarball and run <code>./bin/ecto</code> from the extracted directory. Keep <code>bin/</code> and <code>share/</code> together. The tarball requires glibc 2.35+, system graphics libraries and drivers, and a Wayland or X11 session. Install the <code>sqlite3</code> command to resume OpenCode sessions.</p>
          <h3 className="mt-7 text-lg font-semibold text-white">Windows · x64 preview</h3>
          <p className={copy}>On Windows 10 1809 or later, extract <code>{ectoRelease.platforms.windows.assets[0].file}</code> and run <code>ecto.exe</code>. Compare the output of <code>Get-FileHash -Algorithm SHA256 {ectoRelease.platforms.windows.assets[0].file}</code> with the matching checksum file. The ZIP is unsigned, so SmartScreen may warn; it has no installer or automatic updates. Use <code>ecto.com</code> for CLI output, pipes and exit codes.</p>
          <p className={copy}>Native desktop acceptance is pending for Linux and Windows; clipboard, input methods, scaling and graphics compatibility vary by system. Windows working-directory, argument and agent-session inspection are incomplete.</p>
        </section>

        <section className={section}>
          <h2 className={heading}>2. Open a shell and arrange panes</h2>
          <p className={copy}>Launch Ecto and use the terminal as you normally would. Change to your project directory, then start your installed coding agent using its usual command. Agents are separate programs; Ecto provides their terminal workspace.</p>
          <p className={copy}>Open the command palette with <kbd>Cmd+Shift+P</kbd> on macOS or <kbd>Ctrl+Shift+P</kbd> on Linux and Windows. Choose “New tab” for another task, or “Split right” or “Split down” to keep shells visible side by side. By default, macOS uses <kbd>Cmd+T</kbd> for a new tab and <kbd>Cmd+D</kbd> to split right; Linux and Windows use <kbd>Ctrl+Shift+T</kbd> and <kbd>Ctrl+Shift+D</kbd>. Focus a pane before typing into it; zoom a pane when you need more room. The sidebar and pane headers help you navigate the workspace.</p>
          <figure className="mt-8">
            <div className="overflow-hidden border border-[rgba(255,255,255,0.12)] bg-[#050505]">
              <Image src="/images/ecto/docs/workspace-split-panes.png" alt="Ecto workspace with a sidebar and three split terminal panes" width={1448} height={981} sizes="(max-width: 840px) 100vw, 840px" className="block h-auto w-full" />
            </div>
            <figcaption className="mt-[10px] text-[10px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.4)]">Three terminal panes alongside the sidebar.</figcaption>
          </figure>
        </section>

        <section id="keyboard-shortcuts" className={section}>
          <h2 className={heading}>Keyboard shortcuts</h2>
          <p className={copy}>Default shortcuts for Ecto {ectoRelease.version}. Bindings can be customized; the command palette shows the available actions.</p>
          <div className="mt-6 overflow-x-auto border border-[rgba(255,255,255,0.12)]">
            <table className="w-full min-w-[620px] border-collapse text-left text-[13px] leading-[1.5]">
              <thead className="bg-[rgba(255,255,255,0.04)] text-[11px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.55)]">
                <tr><th scope="col" className="px-4 py-3">Action</th><th scope="col" className="px-4 py-3">macOS</th><th scope="col" className="px-4 py-3">Linux / Windows</th></tr>
              </thead>
              <tbody>
                {shortcuts.map(([action, mac, other]) => (
                  <tr key={action} className="border-t border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)]">
                    <th scope="row" className="px-4 py-3 font-medium text-white">{action}</th><td className="px-4 py-3"><kbd>{mac}</kbd></td><td className="px-4 py-3"><kbd>{other}</kbd></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="cli-reference" className={section}>
          <h2 className={heading}>CLI reference</h2>
          <p className={copy}>Use the CLI bundled with the running Ecto app. On macOS, choose <strong>Install ecto command</strong> in the command palette to add it to your PATH; the Linux Debian package installs it on PATH. On Windows, use <code>ecto.com</code> for terminal output. In an Ecto pane, list panes and inspect their output:</p>
          <pre className={code}><code>{`ecto --help
ecto list
ecto read 1`}</code></pre>
          <p className={copy}>Replace <code>1</code> with a pane ID from <code>ecto list</code>. A target can also be a pane name, program, <code>group/name</code>, or a direction such as <code>right</code>; directions require an identified caller pane. Name and program targets resolve within the caller&rsquo;s tab, then its group. Use a specific ID or group and name when targets are ambiguous.</p>
          <div className="mt-6 overflow-x-auto border border-[rgba(255,255,255,0.12)]">
            <table className="w-full min-w-[480px] border-collapse text-left text-[13px] leading-[1.5]">
              <thead className="bg-[rgba(255,255,255,0.04)] text-[11px] uppercase tracking-[0.08em] text-[rgba(255,255,255,0.55)]"><tr><th scope="col" className="px-4 py-3">Command</th><th scope="col" className="px-4 py-3">Purpose</th></tr></thead>
              <tbody>{commands.map(([command, purpose]) => <tr key={command} className="border-t border-[rgba(255,255,255,0.08)] text-[rgba(255,255,255,0.7)]"><th scope="row" className="px-4 py-3 font-mono font-medium text-white">{command}</th><td className="px-4 py-3">{purpose}</td></tr>)}</tbody>
            </table>
          </div>
          <p className={copy}>These examples operate on pane 1; substitute the ID you selected before running them. Splitting creates a pane, and prompting sends text and presses Return in the target shell.</p>
          <pre className={code}><code>{`ecto split 1 --dir right
ecto new-tab
ecto focus 1
ecto name 1 Work
ecto prompt 1 'pwd'`}</code></pre>
          <p className={copy}>Use <code>ecto read 1 --lines 20</code> to limit the output, or add <code>--json</code> for structured results. Run <code>ecto --help</code> for the complete command and flag list.</p>
        </section>

        <section className={section}>
          <h2 className={heading}>3. Work with agents</h2>
          <p className={copy}>Start an agent in each pane you need, give each its task, and switch between panes to review output or respond. Status indicators appear in pane headers, tabs and the sidebar; an interrupted agent can leave a stale working indicator until it reports again.</p>
          <p className={copy}>Ecto also provides local CLI and MCP controls for inspecting panes, reading output, opening tabs, splitting panes and sending input on demand. On macOS, use <strong>Install ecto command</strong> in the command palette to add the bundled CLI to your PATH. The Debian package installs it on PATH. Automatic coordination, waiting and delegation are outside the Free edition.</p>
        </section>

        <section className={section}>
          <h2 className={heading}>4. Return to your session</h2>
          <p className={copy}>Quit and reopen Ecto to restore saved windows, tabs, splits, names and scrollback. Session restoration is enabled by default. Ecto also attempts to resume agent conversations when the agent harness and saved session support it; a restored layout does not guarantee a resumed conversation.</p>
          <p className={copy}>Saved layout templates and named workspaces offer another way to organize your setup. For release-specific limitations and changes, see the <a className={link} href={ectoRelease.notesUrl}>release notes</a>.</p>
        </section>
        <Link href="/ecto#downloads" className={link}>Download Ecto →</Link>
      </main>
      <Footer />
    </div>
  );
}
