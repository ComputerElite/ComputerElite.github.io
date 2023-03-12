using QuestPatcher.QMod;
using System.IO.Compression;
using System.Net;
using System.Text.Json;

namespace ModUpdater
{
	internal class ModJSON
	{
		public Dictionary<string, List<ModJSONMod>> versions = new Dictionary<string, List<ModJSONMod>>();

		public static ModJSON GetCurrentMods()
		{
			ModJSON r = new ModJSON();
			WebClient c = new WebClient();
			r.versions = JsonSerializer.Deserialize<Dictionary<string, List<ModJSONMod>>>(c.DownloadString("https://computerelite.github.io/tools/Beat_Saber/mods.json"));
			return r;
		}

		public void AddMod(string downloadLink)
		{
			if (!downloadLink.Contains("github.com")) return;
			WebClient client = new WebClient();
			try
			{
				client.Headers.Add("authorization", File.ReadAllText("token.txt"));
				client.Headers.Add("User-Agent", "ModUpdater/0.1");
				if (!downloadLink.EndsWith(".qmod")) return;
				Console.WriteLine("Downloading from " + downloadLink);
				client.DownloadFile(downloadLink, "mod.qmod");
				QMod mod = QMod.ParseAsync(ZipFile.OpenRead("mod.qmod")).Result;
				ModJSONMod j = new ModJSONMod();
				j.name = mod.Name;
				j.description = mod.Description;
				j.author = mod.Author + ", " + mod.Porter;
				if(j.author.EndsWith(", ")) j.author = j.author.Substring(0, j.author.Length - 2);
				j.version = mod.Version.ToString();
				j.id = mod.Id;
				j.download = downloadLink;
				j.source = downloadLink.Substring(0, downloadLink.IndexOf("releases"));
				string gameVersion = mod.PackageVersion;
				if (gameVersion == null) gameVersion = "undefined"; // undefined is for game version agnostic mods
				if (!versions.ContainsKey(gameVersion)) versions.Add(gameVersion, new List<ModJSONMod>());
				foreach (ModJSONMod m in versions[gameVersion])
				{
					if (m.download == j.download) return;
				}
				Console.WriteLine("Added mod " + j.name + " - " + j.version + " for " + gameVersion + " to list.");
				File.Delete("mod.qmod");
				versions[gameVersion].Add(j);
			} catch(Exception e)
			{
				client.Dispose();
				Console.WriteLine("failed: " + e.ToString());
			}
			
		}
	}
		
	internal class ModJSONMod
	{
		public string name { get; set; } = "";
		public string description { get; set; } = "";
		public string id { get; set; } = "";
		public string version { get; set; } = "";
		public string download { get; set; } = "";
		public string source { get; set; } = "";
		public string author { get; set; } = "";
	}
}
