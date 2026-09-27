import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Box,
  Code2,
  Database,
  Globe2,
  Layers3,
  Workflow,
} from "lucide-react";

export const metadata = {
  title: "Merqato.Digital — Digital studio in Palawan",
  description:
    "Merqato.Digital is a creative technology studio based in Palawan. We build thoughtful websites, digital systems, and useful automations for ambitious businesses.",
  alternates: { canonical: "https://merqato.digital" },
  openGraph: {
    title: "Merqato.Digital — Local businesses. Distinct digital worlds.",
    description:
      "A creative technology studio rooted in Palawan, building thoughtful websites and practical digital systems for businesses everywhere.",
    url: "https://merqato.digital",
    siteName: "Merqato.Digital",
    images: [
      {
        url: "/merqato-hero.jpg",
        width: 1536,
        height: 864,
        alt: "Misty limestone islands and calm water in Palawan",
      },
    ],
    locale: "en_PH",
    type: "website",
  },
};

const services = [
  {
    number: "01",
    title: "Websites",
    description:
      "Distinct, responsive sites built around the way your business actually works. Clear enough to find. Considered enough to remember.",
    detail: "Strategy · Art direction · Development",
  },
  {
    number: "02",
    title: "Digital systems",
    description:
      "Simple tools that bring your content, customers, and daily work together — without asking your team to learn a dozen disconnected platforms.",
    detail: "Information architecture · Interfaces · Data",
  },
  {
    number: "03",
    title: "Automation",
    description:
      "Useful workflows that save time and keep people in control. We automate the repetitive parts, not the parts that make your business human.",
    detail: "Workflows · Integrations · Operations",
  },
];

const stack = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Tailwind CSS 4",
  "Drizzle ORM",
  "Neon Postgres",
  "MCP",
  "Zod",
  "Framer Motion",
  "Playwright",
];

const studioModules = [
  "CRM & pipeline",
  "Tasks & operations",
  "Invoices & expenses",
  "Content studio",
  "Campaigns & publishing",
  "AI queue & agents",
  "Knowledge base",
  "Workflows & webhooks",
  "Audit & reporting",
];

const work = [
  {
    title: "A slower kind of stay",
    type: "Hospitality · Digital experience",
    image: "/merqato-work-hospitality.jpg",
    className: "mq-work-card--tall",
  },
  {
    title: "Made close to home",
    type: "Independent retail · Brand system",
    image: "/merqato-work-retail.jpg",
    className: "mq-work-card--wide",
  },
];

function ArrowLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link className="mq-arrow-link" href={href}>
      <span>{children}</span>
      <ArrowUpRight aria-hidden="true" size={16} strokeWidth={1.8} />
    </Link>
  );
}

export default function Page() {
  return (
    <main className="merqato-site">
      <header className="mq-nav">
        <div className="mq-shell mq-nav-inner">
          <Link className="mq-wordmark" href="#top" aria-label="Merqato.Digital home">
            <span>merqato</span><b>.</b><small>digital</small>
          </Link>

          <nav className="mq-nav-links" aria-label="Main navigation">
            <Link href="#services">What we do</Link>
            <Link href="#approach">Our approach</Link>
            <Link href="#work">Selected work</Link>
            <Link href="#contact">Contact</Link>
          </nav>

          <Link className="mq-nav-button" href="#contact">
            Start a project <ArrowUpRight aria-hidden="true" size={15} strokeWidth={1.8} />
          </Link>

          <details className="mq-mobile-menu">
            <summary aria-label="Open navigation menu"><span /><span /></summary>
            <nav aria-label="Mobile navigation">
              <Link href="#services">What we do</Link>
              <Link href="#approach">Our approach</Link>
              <Link href="#work">Selected work</Link>
              <Link href="#contact">Contact</Link>
            </nav>
          </details>
        </div>
      </header>

      <section className="mq-hero" id="top" aria-labelledby="hero-title">
        <div className="mq-hero-art" aria-hidden="true">
          <Image
            src="/merqato-hero.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="mq-hero-image"
          />
        </div>
        <div className="mq-shell mq-hero-grid">
          <div className="mq-hero-copy">
            <p className="mq-eyebrow mq-hero-eyebrow"><span className="mq-dot" /> Digital studio · Palawan</p>
            <h1 id="hero-title">
              Local businesses.
              <em>Distinct digital worlds.</em>
            </h1>
            <p className="mq-hero-lede">
              We build thoughtful websites and digital systems for ambitious businesses. Rooted in Palawan. Made to work anywhere.
            </p>
            <div className="mq-hero-actions">
              <Link className="mq-button mq-button--light" href="#contact">
                Tell us what you&apos;re building <ArrowUpRight aria-hidden="true" size={17} strokeWidth={1.8} />
              </Link>
              <Link className="mq-text-link mq-text-link--light" href="#work">
                See selected work <ArrowDown aria-hidden="true" size={16} strokeWidth={1.8} />
              </Link>
            </div>
          </div>

          <div className="mq-hero-aside">
            <div className="mq-location-mark"><Globe2 aria-hidden="true" size={16} strokeWidth={1.5} /><span>09° 44&apos; N<br />PALAWAN, PH</span></div>
            <p>Small studio.<br /><strong>Big picture.</strong></p>
            <span className="mq-hero-line" />
            <p className="mq-hero-aside-note">Strategy, design, development<br />&amp; automation for real businesses.</p>
          </div>

          <div className="mq-hero-footer">
            <span>Scroll to explore</span>
            <ArrowDown aria-hidden="true" size={16} strokeWidth={1.5} />
            <span className="mq-hero-counter">01 <i /> 04</span>
          </div>
        </div>
      </section>

      <section className="mq-intro mq-section" id="studio" aria-labelledby="intro-title">
        <div className="mq-shell">
          <div className="mq-section-kicker"><span>01</span><span>Made for real business</span></div>
          <div className="mq-intro-grid">
            <h2 id="intro-title">Good digital work should <em>feel like it belongs to you.</em></h2>
            <div className="mq-intro-copy">
              <p>Every business has its own rhythm. We start there, then make something clear, useful, and unmistakably yours.</p>
              <p>That might be a better front door for your customers, a calmer way for your team to work, or a small bit of automation that gives you an afternoon back.</p>
              <ArrowLink href="#contact">Work with Merqato</ArrowLink>
            </div>
          </div>
        </div>
      </section>

      <section className="mq-services mq-section" id="services" aria-labelledby="services-title">
        <div className="mq-shell">
          <div className="mq-section-heading">
            <div className="mq-section-kicker"><span>02</span><span>What we do</span></div>
            <h2 id="services-title">A considered digital presence, <em>from first thought to daily use.</em></h2>
          </div>
          <div className="mq-services-list">
            {services.map((service) => (
              <article className="mq-service" key={service.number}>
                <span className="mq-service-number">{service.number} /</span>
                <div className="mq-service-title-wrap"><h3>{service.title}</h3><span className="mq-service-detail">{service.detail}</span></div>
                <p>{service.description}</p>
                <span className="mq-service-symbol" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <div className="mq-marquee" aria-label="Merqato.Digital studio statement">
        <div className="mq-marquee-track">
          <span>Rooted in Palawan</span><i>✳</i><span>Working everywhere</span><i>✳</i><span>Thoughtful by design</span><i>✳</i><span>Rooted in Palawan</span><i>✳</i><span>Working everywhere</span><i>✳</i>
        </div>
      </div>

      <section className="mq-work mq-section" id="work" aria-labelledby="work-title">
        <div className="mq-shell">
          <div className="mq-work-heading">
            <div>
              <div className="mq-section-kicker"><span>03</span><span>Selected work</span></div>
              <h2 id="work-title">Different businesses.<br /><em>Distinct digital worlds.</em></h2>
            </div>
            <p>A look at the kinds of places, products, and practical systems we like to build.</p>
          </div>
          <div className="mq-work-grid">
            {work.map((item, index) => (
              <article className={`mq-work-card ${item.className}`} key={item.title}>
                <div className="mq-work-image"><Image src={item.image} alt="" fill sizes="(max-width: 760px) 100vw, 50vw" /></div>
                <div className="mq-work-overlay" />
                <div className="mq-work-meta"><span>0{index + 1}</span><span>{item.type}</span></div>
                <div className="mq-work-caption"><h3>{item.title}</h3><ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.6} /></div>
              </article>
            ))}
            <article className="mq-work-card mq-work-card--system">
              <div className="mq-system-orbit" aria-hidden="true"><span /><span /><span /></div>
              <div className="mq-work-meta"><span>03</span><span>Service business · Digital system</span></div>
              <div className="mq-work-caption"><h3>The work behind the work</h3><ArrowUpRight aria-hidden="true" size={19} strokeWidth={1.6} /></div>
            </article>
          </div>
        </div>
      </section>

      <section className="mq-approach mq-section" id="approach" aria-labelledby="approach-title">
        <div className="mq-shell">
          <div className="mq-section-kicker"><span>04</span><span>Our approach</span></div>
          <div className="mq-approach-grid">
            <h2 id="approach-title">Start with the way the business <em>actually works.</em></h2>
            <div className="mq-approach-copy">
              <div className="mq-approach-step"><span>01</span><p><strong>Listen closely.</strong> We look at your customers, your team, and the small frictions hiding in the day-to-day.</p></div>
              <div className="mq-approach-step"><span>02</span><p><strong>Make it clear.</strong> We turn the useful parts into a simple structure people can understand and use.</p></div>
              <div className="mq-approach-step"><span>03</span><p><strong>Keep it yours.</strong> You get a system your business can grow with — not a black box you have to work around.</p></div>
            </div>
          </div>
          <blockquote>“Rooted in Palawan. Made to work anywhere.”</blockquote>
        </div>
      </section>

      <section className="mq-toolkit mq-section" id="toolkit" aria-labelledby="toolkit-title">
        <div className="mq-shell">
          <div className="mq-toolkit-heading">
            <div className="mq-section-kicker mq-section-kicker--dark"><span>05</span><span>Behind the studio</span></div>
            <h2 id="toolkit-title">Thoughtful on the surface.<br /><em>Solid underneath.</em></h2>
            <p>The profile site is one expression of a wider working toolkit. The codebase includes the building blocks for websites, systems, content, operations, and automation — so we can make the right thing for the business in front of us.</p>
          </div>

          <div className="mq-toolkit-layout">
            <div className="mq-toolkit-card mq-toolkit-card--map">
              <div className="mq-toolkit-card-top"><span><span className="mq-status-dot" /> MERQATO / SYSTEM MAP</span><span>MIT</span></div>
              <div className="mq-code-tree" aria-label="A map of the application code tree">
                <div><b>app/</b><span>→ experiences &amp; routes</span></div>
                <div className="mq-tree-child"><b>command</b><span>dashboard · today · tasks · reports</span></div>
                <div className="mq-tree-child"><b>contacts</b><span>leads · pipeline · inbox</span></div>
                <div className="mq-tree-child"><b>finance</b><span>invoices · expenses · financials</span></div>
                <div className="mq-tree-child"><b>marketing</b><span>studio · campaigns · publishing</span></div>
                <div className="mq-tree-child"><b>agent</b><span>skills · workflows · wiki · voice</span></div>
                <div className="mq-tree-child"><b>system</b><span>knowledge · audit · settings</span></div>
                <div><b>lib/</b><span>→ data, integrations &amp; services</span></div>
                <div><b>mcp-server/</b><span>→ agent-ready operations</span></div>
              </div>
            </div>

            <div className="mq-toolkit-stack">
              <div className="mq-toolkit-card mq-toolkit-card--stack">
                <div className="mq-toolkit-card-top"><span>THE TOOLKIT</span><Code2 aria-hidden="true" size={17} strokeWidth={1.5} /></div>
                <div className="mq-stack-list">{stack.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
              <div className="mq-toolkit-card mq-toolkit-card--capabilities">
                <div className="mq-toolkit-card-top"><span>THE BUILDING BLOCKS</span><Layers3 aria-hidden="true" size={17} strokeWidth={1.5} /></div>
                <div className="mq-module-list">{studioModules.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
            </div>
          </div>

          <div className="mq-toolkit-footnote">
            <div><Database aria-hidden="true" size={19} strokeWidth={1.5} /><span>One connected data layer</span></div>
            <div><Workflow aria-hidden="true" size={19} strokeWidth={1.5} /><span>Useful automation, with a human in the loop</span></div>
            <div><Box aria-hidden="true" size={19} strokeWidth={1.5} /><span>Open source foundation · MIT licensed</span></div>
          </div>
        </div>
      </section>

      <section className="mq-contact" id="contact" aria-labelledby="contact-title">
        <div className="mq-shell mq-contact-inner">
          <div className="mq-contact-top"><span>Let&apos;s make something good.</span><span>Merqato.Digital · Palawan</span></div>
          <h2 id="contact-title">Have something<br /><em>in mind?</em></h2>
          <div className="mq-contact-bottom">
            <p>Tell us what you&apos;re building.<br />We&apos;ll start with a conversation.</p>
            <a className="mq-contact-email" href="mailto:david@palawancollective.com">david@palawancollective.com <ArrowUpRight aria-hidden="true" size={21} strokeWidth={1.6} /></a>
          </div>
        </div>
      </section>

      <footer className="mq-footer">
        <div className="mq-shell mq-footer-grid">
          <Link className="mq-wordmark mq-wordmark--footer" href="#top"><span>merqato</span><b>.</b><small>digital</small></Link>
          <div><span className="mq-footer-label">Based in</span><p>Palawan, Philippines<br />Building for everywhere.</p></div>
          <div><span className="mq-footer-label">Say hello</span><p><a href="mailto:david@palawancollective.com">david@palawancollective.com</a><br /><a href="https://merqato.digital">merqato.digital</a></p></div>
          <div className="mq-footer-last"><span>© {new Date().getFullYear()} Merqato.Digital</span><span>Strategy · Design · Development · Automation</span></div>
        </div>
      </footer>
    </main>
  );
}
