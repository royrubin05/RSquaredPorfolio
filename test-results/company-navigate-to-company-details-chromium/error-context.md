# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - complementary [ref=e3]:
      - generic [ref=e5]: R² Portfolio
      - navigation [ref=e6]:
        - link "Dashboard" [ref=e7] [cursor=pointer]:
          - /url: /
          - img [ref=e9]
          - generic [ref=e12]: Dashboard
        - link "Portfolio Companies" [ref=e13] [cursor=pointer]:
          - /url: /companies
          - img [ref=e15]
          - generic [ref=e18]: Portfolio Companies
        - link "Co-Investors" [ref=e19] [cursor=pointer]:
          - /url: /investors
          - img [ref=e21]
          - generic [ref=e26]: Co-Investors
      - link "Settings" [ref=e28] [cursor=pointer]:
        - /url: /settings
        - img [ref=e29]
        - generic [ref=e32]: Settings
    - main [ref=e33]:
      - generic [ref=e35]: Company not found.
  - button "Open Next.js Dev Tools" [ref=e41] [cursor=pointer]:
    - img [ref=e42]
  - alert [ref=e45]
```