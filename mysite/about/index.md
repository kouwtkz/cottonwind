---
layout: /page/default.pug
type: "page"
section: about
image: "/icons/icon.png"
flags:
  variable: true
tags:
  - sitemap
---

# PROFILE

## ($.site.author.name)
### ($.site.author.ename)

![](($.image)){.iconL}{style=border-radius:100px}

<br>

[@($.site.author.twitter.account)](https://twitter.com/($.site.author.twitter.account)){target="_blank"}

もふもふなキャラでほわほわした絵を描いてます！

[かわいい絵](/gallery)が得意です！

九州住み、12/22生まれ​

[» プロフィール詳細](/about/kouwtkz)

[» リンク一覧](/about/link)

## 連絡先
[» こちらに掲載してます！](/about/contact)

## 作業環境
- ペイントソフト
  - CLIP STUDIO PAINT EX
  - Adobe PhotoShop
- ベクターソフト
  - Figma
  - Adobe Illustrator
- コーディング
  - Visual Studio Code

## このサイトについて
- 自力で作ってます！
- ドメインは過去に使ってたものをもう一度取りました！
- [プライバシーポリシー](privacy)
- 技術的に使ったもの
  - ランタイムエンジン: [Deno🐍☔](https://deno.com/runtime){target="_blank"}
  - サイトジェネレータ: [lume🐍🔥](https://lume.land/){target="_blank"}
  - テンプレートエンジン: [Pug🐶](https://pugjs.org/api/getting-started.html){target="_blank"} + マークダウン
  - ホスティングサービス: [CloudFlarePages](https://developers.cloudflare.com/pages/){target="_blank"}\
    （ドメインもCloudflareです）
  - アニメーション: [GSAP](https://greensock.com/gsap/){target="_blank"}
  - ページ遷移: [BarbaJS](https://barba.js.org/){target="_blank"}
  - フォント: [GoogleFonts](https://fonts.google.com/){target="_blank"} + Lulo Clean
  - 絵文字: [Twemoji](https://twemoji.twitter.com/){target="_blank"}
