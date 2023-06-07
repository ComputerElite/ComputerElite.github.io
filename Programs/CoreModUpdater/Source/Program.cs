using System.Net;

string url = "https://git.bmbf.dev/unicorns/resources/-/raw/master/com.beatgames.beatsaber/core-mods.json";
Console.WriteLine("Downloading core mods from " + url);
WebClient c = new ();
c.DownloadFile(url, "coreMods.json");
Console.WriteLine("done");