import Link from "next/link";
import { FiGithub, FiMail } from "react-icons/fi";
import { siteConfig } from "@/lib/site-config";

export function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card)]">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-3">{siteConfig.name}</h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              热爱技术，持续学习，记录成长。
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-semibold mb-3">导航</h3>
            <ul className="space-y-2">
              {siteConfig.nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Friend Links */}
          <div>
            <h3 className="font-semibold mb-3">友链</h3>
            {siteConfig.footer.friendLinks.length > 0 ? (
              <ul className="space-y-2">
                {siteConfig.footer.friendLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">暂无友链，欢迎交换</p>
            )}
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-3">联系方式</h3>
            <div className="space-y-2">
              <a
                href={`https://github.com/${siteConfig.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
              >
                <FiGithub size={16} />
                GitHub
              </a>
              {siteConfig.email && (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)] transition-colors"
                >
                  <FiMail size={16} />
                  Email
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-[var(--card-border)] text-center text-sm text-[var(--muted)]">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
