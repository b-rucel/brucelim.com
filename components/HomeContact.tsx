import Tooltip from './Tooltip';
import OneUp from './OneUp';
import { GitHubIcon, LinkedInIcon, XIcon } from './icons/BrandIcons';

const links = [
    { label: 'GitHub', href: 'https://github.com/b-rucel', host: 'github.com', Icon: GitHubIcon },
    { label: 'Twitter', href: 'https://x.com/b_rucel', host: 'x.com', Icon: XIcon },
    {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/bruce-lim-7bb117a/',
        host: 'linkedin.com',
        Icon: LinkedInIcon,
    },
];

export default function HomeContact() {
    return (
        <footer id="contact" className="hv-contact rounded" aria-label="Contact">
            <div>
                <div className="hv-contact-top">
                    <span>Get in touch</span>
                    <span>Los Angeles, CA</span>
                </div>
                <h2>Let&rsquo;s talk.</h2>
                <a
                    className="hv-cta rounded"
                    href="https://www.linkedin.com/in/bruce-lim-7bb117a/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Say hi ↗
                    <OneUp />
                </a>
            </div>
            <div className="hv-contact-foot">
                <ul>
                    {links.map(({ label, href, host, Icon }) => (
                        <li key={label}>
                            <Tooltip label={host}>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2"
                                >
                                    <Icon size={16} />
                                    {label}
                                </a>
                            </Tooltip>
                        </li>
                    ))}
                </ul>
                <span>© {new Date().getFullYear()} Bruce Lim</span>
            </div>
        </footer>
    );
}
