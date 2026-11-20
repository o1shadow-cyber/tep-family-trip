/* Food cards for the trip page. Directions origins are not shown. */
var FOOD_HOTELS = {
  sherwood: {name:"Sherwood Suites", addr:"Sherwood Suites, 192 Nam Ky Khoi Nghia, Ho Chi Minh City"},
  fusion: {name:"Fusion Original Saigon Centre", addr:"Fusion Original Saigon Centre, 65 Le Loi, Ho Chi Minh City"},
  tirant: {name:"Tirant Hotel", addr:"Hanoi Tirant Hotel, 38 Gia Ngu, Hoan Kiem, Hanoi"},
  merlin: {name:"Phuket Marriott Resort & Spa, Merlin Beach", addr:"Phuket Marriott Resort and Spa, Merlin Beach"},
  dt: {name:"DoubleTree by Hilton Bangkok Ploenchit", addr:"DoubleTree by Hilton Bangkok Ploenchit"}
};
var FOOD_CITY_HOTEL = {saigon:"fusion", hanoi:"tirant", phuket:"merlin", bangkok:"dt"};
var FOOD_CITY_IN = {saigon:"Ho Chi Minh City", hanoi:"Hanoi", phuket:"Phuket", bangkok:"Bangkok"};
var FOOD_ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8"/></svg>';
/* Former Sherwood list. All are a short ride from Fusion (about 1.1–2.4 km).
   No minute chip: the measured drive times ignore traffic. */
var SHERWOOD_TO_FUSION = {
  "Izakaya TOKI":1, "La SIRENA Saigon":1, "Nhà Anh":1, "HOME Saigon":1,
  "Merci Bakery":1, "Vị Sài Gòn":1, "Pizza 4P’s Hai Bà Trưng":1, "Little HaNoi Egg Coffee":1
};

function foodEsc(s) {
  return String(s).replace(/[&<>"']/g, function(c) {
    return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c];
  });
}
function foodSkip(g) { return /^skip\b/i.test((g.label || "").trim()); }
function foodSection(group) {
  if (foodSkip(group)) return {title:"Skip", sub:""};
  if (group.label === "Short Grab ride") return {title:"Short Grab ride", sub:""};
  if (group.label === "Bars") return {title:"Bars", sub:"Adults only"};
  if (!group.label) return {title:"Near the hotel", sub:""};
  if (/^old town\b/i.test(group.label)) return {title:"Old Town food", sub:"One trip · 35–50 min each way"};
  var bits = group.label.split(" · ");
  return {title:bits[0], sub:bits.slice(1).join(" · ")};
}
function foodOriginId(city, group) {
  if (city === "saigon") return "fusion";
  if (group.h && FOOD_HOTELS[group.h]) return group.h;
  return FOOD_CITY_HOTEL[city];
}
function foodDest(place, city) {
  if (place.d) return place.d;
  if (place.q) return place.q;
  if (place.map) {
    try {
      var q = new URL(place.map).searchParams.get("query");
      if (q) return q;
    } catch (e) {}
  }
  return place.n + ", " + FOOD_CITY_IN[city];
}
function foodSaysWalk(w) { return /\bwalk/i.test(w || ""); }
function foodDir(origin, dest, mode) {
  return "https://www.google.com/maps/dir/?api=1&origin=" + encodeURIComponent(origin) +
    "&destination=" + encodeURIComponent(dest) + "&travelmode=" + mode;
}
function foodBtn(label, href, kind, extra) {
  var icon = kind === "dir" ? FOOD_ARROW : "";
  return '<a class="fd-btn ' + kind + '" href="' + foodEsc(href) + '" target="_blank" rel="noopener"' + (extra || "") + '><span>' + icon + foodEsc(label) + '</span></a>';
}
function foodGroups(city) {
  var hotels = city.hotels;
  if (city.city === "saigon") {
    var sherwood = null, i;
    for (i = 0; i < hotels.length; i++) if (hotels[i].h === "sherwood") sherwood = hotels[i];
    var moved = (sherwood ? sherwood.p : []).filter(function(p) { return SHERWOOD_TO_FUSION[p.n]; }).map(function(p) {
      var copy = {};
      for (var k in p) if (k !== "w") copy[k] = p[k];
      return copy;
    });
    var grab = {label:"Short Grab ride", p:moved};
    var out = [];
    hotels.forEach(function(g) {
      if (g.h === "sherwood") return;
      out.push(g);
      if (g.h === "fusion") out.push(grab);
    });
    return out;
  }
  if (city.city === "bangkok") return hotels.concat(BKK_AROUND, BKK_MART);
  return hotels;
}

var BKK_AROUND = {label:"Getting around from the hotel", walk:true, p:[
  {n:"Phloen Chit BTS", w:"7–8 min walk", y:"Exit 4, on the same side of Sukhumvit. No need to cross the main road.", d:"Phloen Chit BTS Station, Bangkok"},
  {n:"Chit Lom BTS", w:"1 BTS stop", y:"Walk to Phloen Chit, then one stop west. The skywalk from the station reaches the malls. Skip the long hot sidewalk.", d:"Chit Lom BTS Station, Bangkok"},
  {n:"Siam BTS", w:"2 BTS stops", y:"Walk to Phloen Chit, then two stops. Skywalk into Siam Paragon, Siam Center, and Siam Discovery. Door to door about 15–25 min.", d:"Siam BTS Station, Bangkok"},
  {n:"Central Embassy", w:"10–12 min walk", y:"Walk, or use the Phloen Chit skywalk via Exit 5 so you don’t cross the big intersection.", d:"Central Embassy, Ploenchit Road, Bangkok"},
  {n:"Lumphini Park", w:"20–25 min walk", y:"Grab is the better choice in the heat. This is not a 10–15 minute walk.", d:"Lumphini Park, Bangkok"},
  {n:"MRT Sukhumvit", w:"18–24 min walk", y:"Nearest MRT, at Asok. Easier: Nana BTS, then one stop to Asok.", d:"MRT Sukhumvit Station, Bangkok"}
]};
var BKK_MART = {label:"Mini-marts nearby", walk:true, p:[
  {n:"7-Eleven", w:"~4 min walk", y:"24 hours. In the Ploenchit Centre cluster, at the mouth of the soi.", d:"7-Eleven, Ploenchit Centre, Sukhumvit Road, Bangkok"},
  {n:"Lawson 108", w:"~4 min walk", y:"Ploenchit Centre, ground floor. Hours vary, check on arrival.", d:"Lawson 108, Ploenchit Centre, Bangkok"},
  {n:"Villa Market", w:"~4 min walk", y:"Supermarket on B1 at Ploenchit Centre. Closes at 10 PM.", d:"Villa Market, Ploenchit Centre, Bangkok"},
  {n:"Tops Food Hall", w:"15 min walk", y:"Ground floor, Central Chidlom. Open 8 AM–10 PM. Easier: BTS to Chit Lom, then the skywalk.", d:"Tops Food Hall, Central Chidlom, Bangkok"}
]};

function foodCard(place, hotel, opts) {
  var skip = opts.skip, forceWalk = opts.forceWalk;
  var mode = (forceWalk || foodSaysWalk(place.w)) ? "walking" : "driving";
  var dest = foodDest(place, opts.city);
  var acts = "";
  if (!skip) {
    acts += foodBtn("Directions", foodDir(hotel.addr, dest, mode), "dir",
      ' data-origin="' + foodEsc(hotel.name) + '" data-mode="' + mode + '"');
  }
  if (place.map && /google\.com\/maps|maps\.app\.goo\.gl/i.test(place.map)) acts += foodBtn("Map", place.map, "map");
  if (place.res) acts += foodBtn("Reserve", place.res, "go");
  else if (place.act && place.map && /reserv/i.test(place.act)) acts += foodBtn("Reserve", place.map, "go");
  var bits = [];
  if (place.r) bits.push('<i>★</i> ' + foodEsc(place.r) + (place.k ? ' (' + foodEsc(place.k) + ')' : ''));
  if (place.w) bits.push(foodEsc(place.w));
  var meta = bits.join(" · ");
  var tags = [];
  if (place.t) tags.push('<span class="fd-tag">' + foodEsc(place.t) + '</span>');
  if (opts.adults || place.adults) tags.push('<span class="fd-tag adult">Adults-only</span>');
  var tagRow = tags.length ? '<span class="fd-tags">' + tags.join("") + '</span>' : '';
  var more = place.c ? foodEsc(place.c) : '';
  return '<article class="fd-card"><button type="button" class="fd-hit" aria-expanded="false"><span class="fd-name">' + foodEsc(place.n) + '</span>' +
    tagRow +
    (meta ? '<span class="fd-meta">' + meta + '</span>' : '') +
    (place.y ? '<span class="fd-note">' + foodEsc(place.y) + '</span>' : '') +
    (more ? '<span class="fd-extra">' + more + '</span>' : '') +
    '</button>' + (acts ? '<div class="fd-acts">' + acts + '</div>' : '') + '</article>';
}

function renderFood() {
  var tabs = FOOD.map(function(c) {
    return '<a class="fd-tab" href="#food-' + c.city + '" style="--c:var(--' + c.city + ')">' + foodEsc(c.label) + '</a>';
  }).join("");
  var cities = FOOD.map(function(city) {
    var groups = foodGroups(city);
    var cats = ["All"];
    groups.forEach(function(group) {
      var title = foodSection(group).title;
      if (cats.indexOf(title) < 0) cats.push(title);
    });
    var pills = '<div class="fd-filters" role="tablist">' + cats.map(function(cat, i) {
      return '<button type="button" class="fd-pill' + (i === 0 ? ' on' : '') + '" data-cat="' + foodEsc(cat) + '">' + foodEsc(cat) + '</button>';
    }).join("") + '</div>';
    var body = groups.map(function(group) {
      var copy = foodSection(group);
      var hotel = FOOD_HOTELS[foodOriginId(city.city, group)];
      var cards = group.p.map(function(place) {
        return foodCard(place, hotel, {skip:foodSkip(group), forceWalk:!!group.walk, adults:!!group.adults, city:city.city});
      }).join("");
      return '<section class="fd-group" data-cat="' + foodEsc(copy.title) + '"><header class="fd-kicker"><h3>' + foodEsc(copy.title) + '</h3>' +
        (copy.sub ? '<p>' + foodEsc(copy.sub) + '</p>' : '') +
        '</header><div class="fd-list">' + cards + '</div>' +
        (group.note ? '<p class="fd-foot">' + foodEsc(group.note) + '</p>' : '') + '</section>';
    }).join("");
    groups = pills + body;
    return '<section class="fd-city" id="food-' + city.city + '" style="--c:var(--' + city.city + ')"><div class="fd-cityhead"><strong>' +
      foodEsc(city.label) + '</strong><span>' + foodEsc(city.dates) + '</span></div>' + pills + body + '</section>';
  }).join("");
  return '<section class="sec wrap wide" id="food"><div class="kicker">Eat nearby</div><h2 style="margin-top:14px">Food</h2>' +
    '<p class="sub">Google ratings as of Nov 2026.</p><div class="fd-tabs">' + tabs + '</div>' + cities + '</section>';
}

function bindFood() {
  var root = document.getElementById("food");
  if (!root) return;
  root.addEventListener("click", function(e) {
    var pill = e.target.closest(".fd-pill");
    if (pill && root.contains(pill)) {
      var cityEl = pill.closest(".fd-city");
      var cat = pill.getAttribute("data-cat");
      [].slice.call(cityEl.querySelectorAll(".fd-pill")).forEach(function(p) {
        p.classList.toggle("on", p === pill);
      });
      [].slice.call(cityEl.querySelectorAll(".fd-group")).forEach(function(g) {
        g.hidden = cat !== "All" && g.getAttribute("data-cat") !== cat;
      });
      return;
    }
    if (e.target.closest("a")) return;
    var hit = e.target.closest(".fd-hit");
    if (!hit || !root.contains(hit)) return;
    var card = hit.closest(".fd-card");
    var open = card.classList.toggle("open");
    hit.setAttribute("aria-expanded", open ? "true" : "false");
  });
  var tabs = [].slice.call(root.querySelectorAll(".fd-tab"));
  if (!("IntersectionObserver" in window)) return;
  var io = new IntersectionObserver(function(es) {
    es.forEach(function(e) {
      if (!e.isIntersecting) return;
      tabs.forEach(function(a) { a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id); });
    });
  }, {rootMargin:"-40% 0px -45% 0px"});
  [].slice.call(root.querySelectorAll(".fd-city")).forEach(function(s) { io.observe(s); });
}
