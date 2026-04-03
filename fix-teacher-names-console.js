// FIX TEACHER NAMES — paste in browser console on /admin page
// Uses Firebase REST API — no module imports needed

(async () => {
  const DB = "https://music-mind-academy-default-rtdb.firebaseio.com";

  // Get auth token from the logged-in user
  const token = await window.__FIREBASE_AUTH_TOKEN__ ||
    await (async () => {
      // Try to get token from Firebase Auth internals
      const iframe = document.querySelector('iframe[src*="firebaseapp"]');
      // Fallback: grab from IndexedDB
      const dbs = await indexedDB.databases();
      const fbDb = dbs.find(d => d.name?.includes('firebaseLocalStorage'));
      if (!fbDb) {
        // Try fetching without auth (if rules allow)
        return null;
      }
      return null;
    })();

  // Try fetching without auth first (read may be open)
  async function fbGet(path) {
    const res = await fetch(`${DB}/${path}.json`);
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return res.json();
  }

  async function fbUpdate(updates) {
    const res = await fetch(`${DB}/.json`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error(`PATCH failed: ${res.status} ${await res.text()}`);
    return res.json();
  }

  const NAME_FIXES = {
    "augustaitis.inga@ccsd59.org": "Inga Augustaitis",
    "amccormick@eastlakeacademy.org": "Alexis McCormick",
    "apoll@fcps.edu": "Amelia Poll",
    "ehanson@longmeadow.k12.ma.us": "Erin Hanson",
    "fooyta@kalamazoopublicschools.net": "Taryn Fooy",
    "anewton@msad11.org": "Adam Newton",
    "jessica.vu@mytas.edu.vn": "Jessica Vu",
    "carriejirava@gmail.com": "Carrie Jirava",
    "10017296@casdschools.org": "Luther March",
    "dwilson539@go.tahomasd.us": "Dylan Wilson",
    "10015017@casdschools.org": "Niema Davis",
    "kimberly.collison@oneontacsd.org": "Kimberly Collison",
    "quarlesm@casdschools.org": "Matthew Quarles",
    "rconnelly@fmschools.org": "Rose Connelly",
    "rmobley@ofr5.com": "Robert Mobley",
    "mrsagoins@gmail.com": "Ara-Viktoria McKinney-Bookman",
    "emilyabolles@gmail.com": "Emily Bo",
    "rebekka_rosen@greenwich.k12.ct.us": "Rebekka Rosen",
    "jayjay497@gmail.com": "Jose Falcon",
    "23mstone@gmail.com": "Madison Stone",
    "jrickeytrumpet@gmail.com": "Jason Rickey",
    "hilary.toerner@gmail.com": "Hilary Toerner",
    "andberrmull@gmail.com": "Andrea Mulligan",
    "sharonskaggs84@gmail.com": "Sharon Skaggs",
    "pamwgambrell@gmail.com": "Pamela Gambrell",
    "zannetasmith@gmail.com": "Zanneta Kubajak",
    "emma.vogel@colchestersd.org": "Emma Vogel",
    "jennyrventer@gmail.com": "Jenny Venter",
    "carrie.anne.nichols@gmail.com": "Carrie Nichols",
    "haomeara4@gmail.com": "Haley O'Meara",
    "danielle.haffner@gmail.com": "Danielle Haffner",
    "rachelamov@gmail.com": "Rachel Amov",
    "allison.friedman@me.com": "Allison Friedman",
    "jamesludwig32@gmail.com": "James Ludwig",
    "bestnotestudio@gmail.com": "Leslie Best",
    "myleskifner@gmail.com": "Myles Kifner",
    "sydneywemhoff@gmail.com": "Sydney Wemhoff",
    "ljgroves@k12.wv.us": "Laura Groves",
    "locopianowoman@gmail.com": "Lisa Benton",
    "stephanie.corbett@marlboroschools.org": "Stephanie Corbett",
    "akrolikowski@esd20.org": "Alan Krolikowski",
    "hillarythomson@gmail.com": "Hillary Thomson",
    "burleigh93@gmail.com": "Andrea Burleigh",
    "johnbarryblack@gmail.com": "Lynda Black",
    "ilikecanadianmusic@gmail.com": "Andrea Phillips",
    "springera@nwlschools.org": "Alyssa Springer",
    "p.mann@stpaulkensington.org": "Polina Mann",
    "brandonvalerino@gmail.com": "Brandon Valerino",
    "rencro123@gmail.com": "Renae Cross",
    "rcarruthers@jd.cnyric.org": "Robin Carruthers",
    "musiceducationmama@gmail.com": "Tiffany Wilson",
    "aross@mcspresidents.org": "Alexander Ross",
    "ataube@fmschools.org": "Anna Taube",
    "bsulecki@attleborops.net": "Bethany Sulecki",
    "polhemust@newmilfordps.org": "Tim Polhemus",
    "eberg@stjohnbaptist.net": "Erin Berg",
    "masons@newmilfordps.org": "Scott Mason",
    "rhucko@allendalecolumbia.org": "Rachel Hucko",
    "jundem@isd2144.org": "Jacquie Undem",
    "earnhearta@hfparishschool.org": "Anne Earnheart",
    "sgrant@medford.k12.ma.us": "Sarah Grant",
    "sjschouweile@cps.edu": "Samantha Soto",
    "ehulse@farmingdaleschools.org": "Eric Hulse",
    "dreynolds@isaz.org": "Daniel Reynolds",
    "ymygdanis@acg.edu": "Yannis Mygdanis",
    "katherine_silcott@olsd.us": "Katie Silcott",
    "rfarris@hamptonhawks.us": "Regina Farris",
    "becky.rhodes@lemondenorman.org": "Becky Rhodes",
    "jlee@communityprep.org": "Janine Lee",
    "egknieriemen@cps.edu": "Emilie Knieriemen",
    "rachel.hucko@gmail.com": "Rachel Hucko",
    "jmclaughlin1@wssdgmail.org": "James McLaughlin",
    "jennifer.stepp@cobbk12.org": "Jennifer Stepp",
    "emma.bergman@orecity.k12.or.us": "Emma Bergman",
    "ethan.krebs@yrdsb.ca": "Ethan Krebs",
    "michael.frontz@watertown.k12.ma.us": "Michael Frontz",
    "ssukeforth@rsu21.net": "Sarah Sukeforth",
    "madison.gaudet@bhrsd.org": "Madison Gaudet",
    "msparzak@saintraphael.org": "Monica Sparzak",
    "lj213708@ddsb.ca": "Leslie Best",
    "aromanoski@mmrschool.org": "Amy Romanoski",
    "lbenton@gcalions.com": "Lisa Benton",
    "dornr@wws.k12.in.us": "Rebecca Dorn",
    "krennar@sjp2school.com": "Karen Rennar",
    "nsciacaluga@loreto.gi": "Nina Sciacaluga Azopardi",
    "jmeyerand@eastpointsc.org": "Jordan Meyerand",
    "kathryn_e_archer@mcpsmd.org": "Katie Archer",
    "shariffskull068@edmonds.wednet.edu": "Lisa Shariffskul",
    "tbrundage@drregional.org": "Tyler Brundage",
    "mansfie250@gmail.com": "Lisa Mansfie",
    "cjirava@holyrosarycc.org": "Carrie Jirava",
    "jskrivseth@mcpsmt.org": "Jenny Skrivseth",
    "aburleigh@montoursville.k12.pa.us": "Andrea Burleigh",
    "gillisk@hrce.ca": "Kate Gillis",
    "shahs@sau29.org": "Sue Hahs",
    "kmcclain@mpspride.org": "Karla McClain",
    "sketchell@cedarburg.k12.wi.us": "Summer Ketchell",
    "msinicropi@gccschool.org": "Mark Sinicropi",
    "fancher_kevin@cusdk8.org": "Kevin Fancher",
    "amiekelp@ahchristian.com": "Amie Kelp",
    "kmccallie@moscowcharterschool.org": "Kori McCallie",
    "sgiliberto1@pghschools.org": "Sarah Giliberto",
    "beddowsd@newmilfordps.org": "Diana Beddows",
    "pahayden@madison.k12.wi.us": "Parlee Hayden",
    "ninahazel6@gmail.com": "Nina Sciacaluga Azopardi",
    "aruiz@amschool.org": "Anissa Ruiz",
    "ljgrovesljgroves@gmail.com": "Laura Groves",
    "gmassimini@stpiusbowie.org": "Gerianna Massimini",
    "cpowell@crockerschools.org": "Candice Powell",
    "christina.carpenter@pallisersd.ab.ca": "Christina Carpenter",
    "jennie.grimes@lcps.org": "Jennie Grimes",
    "lisachouinard@akcs.org": "Lisa Chouinard",
    "ndellomas@glenullinbearcats.org": "Nino Dellomas",
    "krista.chapman@gpsjackets.org": "Krista Chapman",
    "dcheney@upsala.k12.mn.us": "Denise Cheney",
    "jlskrivseth@gmail.com": "Jenny Skrivseth",
    "dsnavely@tahomasd.us": "Dean Snavely",
    "bissetc@pitt.k12.nc.us": "Caroline Bissette",
    "slevasseur@st-anns.ca": "Samantha Levasseur",
    "mbrandhandler@sd113a.org": "Micah Brandhandler",
    "kbowers@madison.k12.al.us": "Kristi Bowers",
    "aschneider@bradleyschools.com": "Amy Schneider",
    "jatchue@magnoliasd.org": "Jennifer Atchue",
    "mbarnes@ofr5.com": "Mary Kate Barnes",
    "sstromberg1@pghschools.org": "Shayne Stromberg",
    "sheilacoop@gmail.com": "Sheila Cooper",
    "matt.chaffins@peake.k12.oh.us": "Matt Chaffins",
    "ljacky@hillsboro-indians.org": "Laura Jacky",
    "jordanmeyerand@gmail.com": "Jordan Meyerand",
    "jwasserman@sgabriel.org": "JoAnne Wasserman",
    "jthornell@hanoverschools.org": "Julienne Thornell",
    "jelanitbrown@gmail.com": "Jenlanit Brown",
    "stonemadison@bcsdschools.net": "Madison Stone",
    "cassandra.mccormick@stanlycountyschools.org": "Cassie McCormick",
    "ccummings@pycsd.org": "Carole Cummings",
    "magoedewaldt@gmail.com": "Maggie Oedewaldt",
    "spencer.caldwell@menifeeusd.org": "Spencer Caldwell",
    "bjarrett@amherst.k12.va.us": "Brenda Jarrett",
    "tylerrae.durkee@wilsonschoolsnc.net": "Tyler Rae Durkee",
    "ejacobsonholtz@neenah.k12.wi.us": "Betsy Jacobson-Holtz",
    "emilybo@cciu.org": "Emily Bo",
    "pcorrea5@cps.edu": "Paris Correa",
    "jrickey@necsd.net": "Jason Rickey",
    "leslie.best@ddsb.ca": "Leslie Best",
    "renae_s_cross@dekalbschoolsga.org": "Renae Cross",
    "susan.reid@hcps.org": "Susan Reid",
    "rslater@npd117.net": "Rob Slater",
    "fsehirlioglu@besaturkey.org": "Feryal Sehirlioglu",
    "lweatherly@nppsd.org": "Lenore Weatherly",
    "jpiper@mamkschools.org": "Jordan Piper",
    "dragana.milenkovic@tdsb.on.ca": "Dragana Milenkovic",
    "lblack@qasbc.ca": "Lynda Black",
    "haffnerd@mdusd.org": "Danielle Haffner",
    "jtatevosian@elmhurst205.org": "Jessica Tatevosian",
    "joshua.fletcher@lincoln.kyschools.us": "Josh Fletcher",
    "d.vasileska@gmail.com": "Dance Vasileska",
    "amckinney-bookman@lexington1.net": "Ara-Viktoria McKinney-Bookman",
    "emma.vogel@gmail.com": "Emma Vogel",
    "ajimenez2@bostonpublicschools.org": "Alana Jimenez",
    "kpope@c-ischools.org": "Katie Pope",
    "rachel.amov@springscs.org": "Rachel Amov",
    "kcorso@wps.org": "Keri Corso",
    "twilson@stmonica.school": "Tiffany Wilson",
    "abross0930@gmail.com": "Alex Ross",
    "ahamilton@veronaschools.org": "Amanda Hamilton",
    "avenkus@staff.colonialsd.org": "Amy Venkus",
    "csmith@warrenk12nc.org": "Cherita Smith",
    "andberr@msn.com": "Andrea Mulligan",
    "kathrynhillary.thomson@tdsb.on.ca": "Hillary Thomson",
    "cooperk@llsd.org": "Kiri Cooper",
    "auskb@groveslearning.org": "Becca Ausk",
    "msh23@scasd.org": "Marisa Hickey",
    "zkubajak@cps.edu": "Zanneta Kubajak",
    "haley.omeara@k12.wv.us": "Haley O'Meara",
    "rrosen1311@gmail.com": "Rebekka Rosen",
    "tashkandim@chelseaschools.com": "Meredith Tashkandi",
    "tshepard@ccsfw.org": "Tyler Shepard",
    "agstudios516@gmail.com": "Angela Gaynor",
    "allisontesta@gmail.com": "Allison Testa",
    "jevaj@crestviewacademy.org": "Jessica Jevanord",
    "clister@nrpsk12.org": "Carla Lister",
    "sfitts@northwood.k12.nh.us": "Sarah Fitts",
    "kirsty.kelly@iszl.ch": "Kirsty Kelly",
    "megan.dixson@stleonards.org": "Megan Dixson",
    "claire.jansenvanrensburg@fideleschristianschool.com": "Claire Jansen Van Rensburg",
    "jludwig@herricksk12.org": "James Ludwig",
    "kkrennar@gmail.com": "Karen Rennar",
    "htoerner@stalbertschool.org": "Hilary Toerner",
    "ann.schertzer@bexley.us": "Ann Schertzer",
    "jnygoodman@gmail.com": "Jen Goodman",
    "sydneywemhoff@leigh.esu7.org": "Sydney Wemhoff",
    "jleclerc05@gmail.com": "Justin Leclerc",
    "mshelleman@cdschools.org": "Mark Shelleman",
    "lmsilveyra@cps.edu": "Mari Silveyra",
    "schroeter_danielle@mybps.us": "Danielle Schroeter",
    "kdennison@sjdrsaints.org": "Katherine Dennison",
    "pottss@wyomingcityschools.org": "Sara Potts",
    "alyssapspringer82@yahoo.com": "Alyssa Springer",
    "esmith@veritassav.org": "Erin Smith",
    "pamela.gambrell@cabarrus.k12.nc.us": "Pamela Gambrell",
    "asutton@fallscityps.org": "Alisha Sutton",
    "holly.huff@whcsd.org": "Holly Stephens",
    "jsullivan@miltonps.org": "Julia Sullivan",
    "wandaleecarew@nlesd.ca": "Wanda-Lee Carew",
    "aknighton@candorcs.org": "Amelia Knighton",
    "katarina.franjic@southtechschools.org": "Katarina Franjic",
    "sfonda@stlouisschool.org": "Sarah Fonda",
    "ldean@paulding.k12.ga.us": "Liz Dean",
    "cmcintire.teacher@gmail.com": "Carrie McIntire",
    "carrieannenichols@gmail.com": "Carrie Nichols",
    "jessica.belanger@rccdsb.ca": "Jessica Belanger",
    "afisher@theoaksacademy.org": "April Fisher",
    "j.venter@eisp.it": "Jenny Venter",
    "bvalerino@westgenesee.org": "Brandon Valerino",
    "a.smorynski@taftsd90.org": "Alicia Smorynski",
    "monica.white@qacps.org": "Monica White",
    "lisa.bolieu@usd417.org": "Lisa Bolieu",
    "moorea@columbiak12.com": "Allyson Moore",
    "rcagle@warrensburgr6.org": "Bob Cagle",
    "ccain@nhshawks.com": "Carrie Cain",
    "frzbdgz@gmail.com": "Renee Owens",
    "danabottomley@johnston.k12.nc.us": "Dana Bottomley",
    "hbrown@monessensd.org": "Hilary Brown",
    "julissamartinez0728@gmail.com": "Julissa Martinez",
    "sgomez44@schools.nyc.gov": "Steven Gomez",
    "frankgilchriest@gmail.com": "Francis Gilchriest",
    "gacj@oacsd.org": "Jenny Gac",
    "coest@milltownps.org": "Cindy Oest",
    "dibarra0513@gmail.com": "Deisy Ibarra",
    "gkapiniak@rvschools.ab.ca": "Greg Kapiniak",
    "tnelsonpayne@allsaintskenosha.org": "Tami Payne",
    "mdavis@stpaulvalpo.org": "Melissa Davis",
    "paigegrahammusic@gmail.com": "Paige Graham",
    "afriedman@portnet.org": "Allison Friedman",
    "mkifner@edencsd.org": "Myles Kifner",
    "sarah.pippen@crossettschools.org": "Sarah Beth Pippen",
    "westbrookp@sw1.k12.wy.us": "Physhaunt Westbrook",
    "jfalcon@bridgeportedu.net": "Jose Falcon",
    "phillipsan@hdsb.ca": "Andrea Phillips",
    "sskaggs@bentonvillek12.org": "Sharon Skaggs",
    "maryannwahl@tguschools.org": "Maryann Wahl",
    "sternea@lmsd.org": "Anne Sterner-Porreca",
    "lballard@sau39.org": "Larry Ballard",
    "polina.mann@stritaschool.org": "Polina Mann",
    "ayarbrough@halfwayschools.org": "Amanda Yarbrough",
    "tyler.erhard@hanovertwpschools.org": "Tyler Erhard",
  };

  console.log("Loaded " + Object.keys(NAME_FIXES).length + " name mappings");
  console.log("Fetching current data from Firebase...");

  var approvedEmails, teacherOutreach;
  try {
    approvedEmails = await fbGet("approvedEmails/academy") || {};
    teacherOutreach = await fbGet("teacherOutreach") || {};
  } catch (e) {
    console.error("Failed to read Firebase. Error:", e.message);
    console.log("Your database rules may require authentication. Try a different approach.");
    return;
  }

  console.log("Got " + Object.keys(approvedEmails).length + " approved emails, " + Object.keys(teacherOutreach).length + " outreach records");

  var updates = {};
  var fixCount = 0;

  for (var emailKey in approvedEmails) {
    var data = approvedEmails[emailKey];
    var email = (data.email || emailKey.replace(/,/g, ".")).toLowerCase();
    var currentName = (data.name || "").trim();
    var correctName = NAME_FIXES[email];
    if (!correctName) continue;
    if (!currentName || currentName !== correctName) {
      console.log("  approvedEmails: \"" + (currentName || "(empty)") + "\" -> \"" + correctName + "\" [" + email + "]");
      updates["approvedEmails/academy/" + emailKey + "/name"] = correctName;
      fixCount++;
    }
  }

  for (var emailKey in teacherOutreach) {
    var data = teacherOutreach[emailKey];
    var email = (data.email || emailKey.replace(/,/g, ".")).toLowerCase();
    var currentName = (data.name || "").trim();
    var correctName = NAME_FIXES[email];
    if (!correctName) continue;
    if (!currentName || currentName !== correctName) {
      console.log("  teacherOutreach: \"" + (currentName || "(empty)") + "\" -> \"" + correctName + "\" [" + email + "]");
      updates["teacherOutreach/" + emailKey + "/name"] = correctName;
      fixCount++;
    }
  }

  for (var emailKey in approvedEmails) {
    var data = approvedEmails[emailKey];
    var email = (data.email || emailKey.replace(/,/g, ".")).toLowerCase();
    if (!teacherOutreach[emailKey] && NAME_FIXES[email]) {
      console.log("  teacherOutreach (NEW): \"" + NAME_FIXES[email] + "\" [" + email + "]");
      updates["teacherOutreach/" + emailKey + "/email"] = email;
      updates["teacherOutreach/" + emailKey + "/name"] = NAME_FIXES[email];
      updates["teacherOutreach/" + emailKey + "/addedAt"] = Date.now();
      fixCount++;
    }
  }

  console.log("\n" + fixCount + " fixes needed");

  if (fixCount === 0) {
    console.log("All names are already correct!");
    return;
  }

  var confirmed = confirm("Apply " + fixCount + " name fixes to Firebase?");
  if (!confirmed) {
    console.log("Cancelled.");
    return;
  }

  try {
    await fbUpdate(updates);
    console.log("Done! " + fixCount + " names updated. Refresh the page to see changes.");
  } catch (e) {
    console.error("Failed to write:", e.message);
  }
})();
