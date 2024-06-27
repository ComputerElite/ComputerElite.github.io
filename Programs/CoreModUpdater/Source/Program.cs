using System.Net;

string url = "https://raw.githubusercontent.com/QuestPackageManager/bs-coremods/main/core_mods.json";
Console.WriteLine("Downloading core mods from " + url);
WebClient c = new ();
c.Headers.Add ("user-agent", "Mozilla/4.0 (compatible; MSIE 6.0; " + 
                                  "Windows NT 5.2; .NET CLR 1.0.3705;)");
c.DownloadFile(url, "coreMods.json");
Console.WriteLine("done");