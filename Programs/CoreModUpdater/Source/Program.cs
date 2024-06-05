using System.Net;

string url = "hhttps://raw.githubusercontent.com/QuestPackageManager/bs-coremods/main/core_mods.json";
Console.WriteLine("Downloading core mods from " + url);
WebClient c = new ();
c.DownloadFile(url, "coreMods.json");
Console.WriteLine("done");