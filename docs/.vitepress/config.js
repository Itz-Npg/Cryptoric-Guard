export default {
  base: '/Cryptoric-Guard/',
  title: "Cryptoric Guard",
  description: "Ultimate Anti-Bypass Framework",
  themeConfig: {
    logo: "/logo.png",
    nav: [
      { text: "Home", link: "/" },
      { text: "Documentation", link: "/introduction" }
    ],
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/introduction" },
          { text: "Quick Start", link: "/quick-start" },
          { text: "Configuration", link: "/configuration" },
          { text: "Cryptography", link: "/cryptography" },
          { text: "Live Example", link: "/example" }
        ]
      }
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/Itz-Npg/Cryptoric-Guard" }
    ],
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 NPG"
    }
  },
  appearance: "dark"
}
