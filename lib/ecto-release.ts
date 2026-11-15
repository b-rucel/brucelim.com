const releaseVersion = '0.1.0';
const releaseTag = `v${releaseVersion}`;
const releasesUrl = 'https://github.com/interzone-group/ecto-releases/releases';

const releaseAsset = (
  label: string,
  file: string,
) => ({
  label,
  file,
});

export const ectoRelease = {
  version: releaseVersion,
  tag: releaseTag,
  repository: 'interzone-group/ecto-releases',
  releasesUrl,
  notesUrl: releasesUrl,
  platforms: {
    macos: {
      name: 'macOS',
      status: 'Primary platform',
      target: 'Universal · Apple Silicon + Intel',
      version: releaseVersion,
      note: 'Ad-hoc signed. Developer ID signing and notarization are still pending.',
      assets: [
        releaseAsset(
          'Universal DMG',
          'Ecto-0.1.0.dmg',
        ),
      ],
    },
    linux: {
      name: 'Linux',
      status: 'Preview',
      target: 'x86_64 · glibc 2.35+',
      version: releaseVersion,
      note: 'x86_64 preview. Native desktop acceptance is still pending.',
      assets: [
        releaseAsset(
          'Debian package',
          'ecto_0.1.0-1_amd64.deb',
        ),
        releaseAsset(
          'Portable tarball',
          'ecto-0.1.0-linux-x86_64.tar.gz',
        ),
      ],
    },
    windows: {
      name: 'Windows',
      status: 'Preview',
      target: 'x64 · Windows 10 1809+',
      version: releaseVersion,
      note: 'Unsigned portable ZIP. No installer or auto-update.',
      assets: [
        releaseAsset(
          'Portable ZIP',
          'Ecto-0.1.0-windows-x64.zip',
        ),
      ],
    },
  },
} as const;

export const ectoReleaseNotes = [
  'libghostty-vt 1.0 is the terminal core.',
  'Font size is set per tab, and sessions restore it.',
  'Agent status shows in pane headers, tabs and the sidebar: working, waiting, needs attention, finished and failed.',
  'Background images can be WebP, including transparency.',
  'On macOS, the Install ecto command action puts the CLI on your PATH.',
  'Fish older than 3.4 now loads the shell integration.',
];
