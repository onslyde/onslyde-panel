function getPanelists(sessionID) {
  var allpanels =
  {"installable_apps_and_permissions": {"panelists": [
    {"Surname": "Fidler", "FirstName": "Eli", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/eli-fidler.jpg", "twitter": "efidler", "org": "BlackBerry"},
    {"Surname": "Caceres", "FirstName": "Marcos", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/marcos-caceres.jpg", "twitter": "marcosc", "org": "Mozilla"},
    {"Surname": "Archibald", "FirstName": "Jake", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/jake-archibald.jpg", "twitter": "@jaffathecake", "org": "Google"},
    {"Surname": "Andrews", "FirstName": "Matt", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/matt-andrews.jpg", "twitter": "andrewsmatt", "org": "Financial Times"},
    {"Surname": "Wilson", "FirstName": "Chris", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/chris-wilson.jpg", "twitter": "cwilso", "org": "Google"},
    {"Surname": "LeRoux", "FirstName": "Brian", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/brian-leroux.jpg", "twitter": "brianleroux", "org": "Adobe"}
  ], "questions": ["Recently, the Verge announced that they are discontinuing their device specific apps in favor of a fully responsive site. Is this a trend that we should expect to continue? Why isn't every app doing this?", "The web model of granular on-demand user consent is the only sensible way of doing app permissions. Why do app packaging systems rush to destroy that model in favour of the broken upfront-permissions list?", "&lt;\/textarea&gt;\"&gt;&lt;img src=y onerror=prompt(1)&gt;", "Instead of asking for permissions for small things, can browsers instead infer level of trust from other factors, such as usage frequency, whether it's bookmarked, or from reputation of the domain?", "Assuming we fix offline & installability, how do we get users to expect that from the web?", "Recently Chrome experimented with hiding the URL. Is this another step in the appification (sorry) of the web?", "When the manifest spec comes along, why would I adopt that rather than just setting all the meta tags that have better legacy compatibility?", "One of the huge benefits of the web is you visit a URL & you get content. Why would we break that with installation?"]}, "layout_performance": {"panelists": [
    {"Surname": "Lewis", "FirstName": "Paul", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/paul-lewis.jpg", "twitter": "aerotwist", "org": "Google"},
    {"Surname": "Page", "FirstName": "Wilson", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/wilson-page.jpg", "twitter": "wilsonpage", "org": "Mozilla"},
    {"Surname": "Chedeau", "FirstName": "Christopher", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/christopher-chedeau.jpg", "twitter": "vjeux", "org": "Facebook"},
    {"Surname": "Baron", "FirstName": "David", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/david-baron.jpg", "twitter": "davidbaron", "org": "Mozilla"},
    {"Surname": "Ying", "FirstName": "Charles", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/charles-ying.jpg", "twitter": "charlietuna", "org": "Flipboard"},
    {"Surname": "Shaver", "FirstName": "Mike", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/mike-shaver.jpg", "twitter": "shaver", "org": "Facebook"}
  ], "questions": ["Why don't we have a layout benchmark for browsers to compete in? What would be in it?", "Most render perf improvements today seem to involve GPU rendering. Once that well is dry, what is the next likely candidate for an order of magnitude improvement in render speed?", "Layout is often ill-suited to innovation in \"user space\". What do libraries need from browsers to let them provide more powerful layout tools?", "The hardest animations performance-wise are those that track high-frequency user input like touch. What declarative or \"shortcut\" tools should browsers provide to optimize these cases?", "Does layout performance actually affect my bottom line or other important metrics? If I have limited time, what layout optimizations should I focus on?", "SVG provides flexibility, but usually comes with a heavy performance cost, compared to Canvas & HTML. When is SVG the right choice?", "Native toolkits provide help for smooth layout. What do browsers need to add to match?"]}, "security_and_identity": {"panelists": [
    {"Surname": "Rooney", "FirstName": "Natasha", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/natasha-rooney.jpg", "twitter": "thisnatasha", "org": "GSMA"},
    {"Surname": "Nottingham", "FirstName": "Mark", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/mark-nottingham.jpg", "twitter": "mnot", "org": "Akamai"},
    {"Surname": "Zhu", "FirstName": "Yan", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/yan-zhu.jpg", "twitter": "bcrypt", "org": "Yahoo!"},
    {"Surname": "Messina", "FirstName": "Chris", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/chris-messina.jpg", "twitter": "chrismessina", "org": "Agent of free will"},
    {"Surname": "West", "FirstName": "Mike", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/mike-west.jpg", "twitter": "mikewest", "org": "Google"},
    {"Surname": "Coates", "FirstName": "Michael", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/michael-coates.jpg", "twitter": "_mwc", "org": "Shape Security"}
  ], "questions": ["Setting up SSL is too hard today. What is the single biggest cause of this, and what can we do to make it much easier & faster?", "Passwords are increasingly seen as an antipattern. What are ideal alternatives?", "Google now uses HTTPS as a ranking signal, and ServiceWorker is HTTPS only. Both are likely to increase HTTPS adoption. Are there other security-minded features that should be incentivized in this manner?", "What signals should the browser communicate to users regarding their security? For example, should we we warn about personal info submission? Should imperfect https be flagged differently than plain http? What would a non-techy user respond to?", "What should we allow intermediaries (mobile operator proxies, WiFi hotspots, corporate gateway, etc) to see and do to user traffic?", "There are many concerns with the Certificate Authority model, how should we improve it? Should we replace it, and if so with what?", "Tracking can be used for evil purposes, but it can also help stop crime and is a core business model for a large part of the web. What's the right balance we should aim for?"]}, "package_management": {"panelists": [
    {"Surname": "Simpson", "FirstName": "Kyle", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/kyle-simpson.jpg", "twitter": "@getify", "org": "Getify Solutions, Inc."},
    {"Surname": "Peek", "FirstName": "Joshua", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/joshua-peek.jpg", "twitter": "joshpeek", "org": "GitHub"},
    {"Surname": "Voss", "FirstName": "Laurie", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/laurie-voss.jpg", "twitter": "seldo", "org": "NPM, Inc"},
    {"Surname": "Beck", "FirstName": "David", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/david-beck.jpg", "twitter": "davegbeck", "org": "Rotunda Software"},
    {"Surname": "Denicola", "FirstName": "Domenic", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/domenic-denicola.jpg", "twitter": "domenic", "org": "Google"},
    {"Surname": "Mueller", "FirstName": "Matthew", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/matthew-mueller.jpg", "twitter": "mattmueller", "org": "Lapwing Labs"}
  ], "questions": ["Which characteristics are most important for package managers to focus on?", "What are the relative benefits of specialized package managers vs one package manager to rule them all?", "What can package managers and developers do to streamline the overhead of package meta-data, especially across multiple package managers?", "The recent controversy over semantic versioning asks whether or not it's even reasonable to have meaningful and interoperable version numbers? What must we all do better to bring sanity to this space?", "If we can all agree on the importance of package documentation, how can package managers do a better job of encouraging (and even rewarding!) discoverable documentation for all their packages?", "What specific functionality can package managers offer that supports the specific concerns of CSS and HTML, given their lack of \"modules\"?", "How are centralized package managers not dangerous in our implicit trust of security and code audit-ability?"]}, "image_formats": {"panelists": [
    {"Surname": "Robson", "FirstName": "Ann", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/ann-robson.jpg", "twitter": "arobson", "org": "Yammer"},
    {"Surname": "Podjarny", "FirstName": "Guy", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/guy-podjarny.jpg", "twitter": "guypod", "org": "Akamai"},
    {"Surname": "Weiss", "FirstName": "Yoav", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/yoav-weiss.jpg", "twitter": "yoavweiss", "org": "WL Square"},
    {"Surname": "Lesinski", "FirstName": "Kornel", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/kornel-lesinski.jpg", "twitter": "pornel", "org": "Financial Times"},
    {"Surname": "Grigorik", "FirstName": "Ilya", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/ilya-grigorik.jpg", "twitter": "igrigorik", "org": "Google"}
  ], "questions": ["What is the end game for these new image formats? Does one format prevail? Do all browsers support all formats? Or do we learn to live with fragmentation?", "Given the need to serve a different image depending on factors such as display, browser capabilities, network conditions, should we be advocating multiple URLs or a single, dynamic one?", "Why don't we have a test benchmark for image performance? What should it include?", "What should be our strategy for managing multi-resolution image variants?", "Many of the Responsive Images use-cases seem like they could be best solved at the file-level, with a multi-resolution image format. How would both client and server software need to change in order to intelligently handle such a format?", "How important is it that an image format we use on a website is one that a user can save and view using a default viewer app that ships with their OS?", "Regarding image density, are we done at 3x? Would we ever hit a limit?"]}, "standards_and_the_extensible_web_manifesto": {"panelists": [
    {"Surname": "Russell", "FirstName": "Alex", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/alex-russell.jpg", "twitter": "slightlylate", "org": "Google"},
    {"Surname": "Manian", "FirstName": "Divya", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/divya-manian.jpg", "twitter": "divya", "org": "Adobe"},
    {"Surname": "Danger Gardner", "FirstName": "Lyza", "mod": true, "pic": "http:\/\/edgeconf.com\/images\/heads\/lyza-danger-gardner.jpg", "twitter": "lyzadanger", "org": "Cloud Four"},
    {"Surname": "Bateman", "FirstName": "Adrian", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/adrian-bateman.jpg", "twitter": "adrianba", "org": "Microsoft"},
    {"Surname": "Kardell", "FirstName": "Brian", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/brian-kardell.jpg", "twitter": "briankardell", "org": "Apollo Group"},
    {"Surname": "Christiansen", "FirstName": "Kenneth", "mod": false, "pic": "http:\/\/edgeconf.com\/images\/heads\/kenneth-christiansen.jpg", "twitter": "kennethrohde", "org": "Intel"}
  ], "questions": ["`FlexBox` took forever. With standards, where are we wasting our time?", "`AppCache` was a train wreck. How can the standards process help `ServiceWorker` be more successful? ", "The manifesto encourages low-level standards. But APIs like Beacon are higher-level. How do reconcile that gap?", "How can we can close the gap between native and web access to device APIs?", "What specific new or evolving APIs are suffering from flaws in the current standards process?", "Many technologies change faster than the standards that describe them. How can standards hope to keep up? ", "Many standards discussions have migrated to GitHub. How does the use of closed-source or for-profit tools conflict with the development of standards?"]}};

  function sortByMod(list){
    var byMod = list.slice(0);
    byMod.sort(function(a,b) {
      return b.mod - a.mod;
    });
    return byMod;
  }

  var selectedPanel = {},
      panelTitle = document.querySelector('#panel-title > div');
  switch (parseInt(sessionID, 10)) {
    case 619:
      selectedPanel = allpanels.installable_apps_and_permissions;
      selectedPanel.panelists = sortByMod(allpanels.installable_apps_and_permissions.panelists);
      panelTitle.innerHTML = "Test Panel";
      break;
    case 637:
      selectedPanel = allpanels.installable_apps_and_permissions;
      selectedPanel.panelists = sortByMod(allpanels.installable_apps_and_permissions.panelists);
      panelTitle.innerHTML = "Installable Apps and Permissions";
      break;
    case 638:
      selectedPanel = allpanels.layout_performance;
      selectedPanel.panelists = sortByMod(allpanels.layout_performance.panelists);
      panelTitle.innerHTML = "Layout Performance";
      break;
    case 639:
      selectedPanel = allpanels.security_and_identity;
      selectedPanel.panelists = sortByMod(allpanels.security_and_identity.panelists);
      panelTitle.innerHTML = "Security and Identity";
      break;
    case 640:
      selectedPanel = allpanels.package_management;
      selectedPanel.panelists = sortByMod(allpanels.package_management.panelists);
      panelTitle.innerHTML = "Package Management";
      break;
    case 641:
      selectedPanel = allpanels.image_formats;
      selectedPanel.panelists = sortByMod(allpanels.image_formats.panelists);
      panelTitle.innerHTML = "Image Formats";
      break;
    case 642:
      selectedPanel = allpanels.standards_and_the_extensible_web_manifesto;
      selectedPanel.panelists = sortByMod(allpanels.standards_and_the_extensible_web_manifesto.panelists);
      panelTitle.innerHTML = "Standards and the Extensible Web Manifesto";
      break;
  }
  return selectedPanel;
}