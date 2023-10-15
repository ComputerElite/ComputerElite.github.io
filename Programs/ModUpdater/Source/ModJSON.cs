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
				if(File.Exists("mod.qmod")) File.Delete("mod.qmod");
				client.DownloadFile(downloadLink, "mod.qmod");
				ZipArchive f = ZipFile.OpenRead("mod.qmod");
				QMod mod = QMod.ParseAsync(f).Result;
				ModJSONMod j = new ModJSONMod();
				j.name = mod.Name;
				j.description = mod.Description;
				j.author = mod.Author + ", " + mod.Porter;
				if(j.author.EndsWith(", ")) j.author = j.author.Substring(0, j.author.Length - 2);
				j.version = mod.Version.ToString();
				j.id = mod.Id;
				j.modloader = mod.ModLoader.ToString();
				j.download = downloadLink;
				j.source = downloadLink.Substring(0, downloadLink.IndexOf("releases"));
				string gameVersion = mod.PackageVersion;
				if (gameVersion == null) gameVersion = "undefined"; // undefined is for game version agnostic mods
				if (!versions.ContainsKey(gameVersion)) versions.Add(gameVersion, new List<ModJSONMod>());
				bool found = false;
				for (int i = 0; i < versions[gameVersion].Count; i++)
				{
					if (versions[gameVersion][i].cover == null && versions[gameVersion][i].id == j.id && versions[gameVersion][i].source.ToLower().Contains("github.com"))
					{
						// Try to get the cover of the mod as it wasn't attempted to be added yet
						Console.WriteLine("Getting cover url for mod " + j.name + " - " + j.version + " for " + gameVersion);
						versions[gameVersion][i].cover = GetCoverUrl(versions[gameVersion][i], mod.CoverImagePath);
						if (versions[gameVersion][i].cover == "")
						{
							Console.ForegroundColor = ConsoleColor.Red;
							Console.WriteLine("Cover not found");
							Console.ForegroundColor = ConsoleColor.White;
						}
						else
						{
							Console.ForegroundColor = ConsoleColor.Green;
							Console.WriteLine("Cover found at " + versions[gameVersion][i].cover);
							Console.ForegroundColor = ConsoleColor.White;
						}
						Console.WriteLine("Updated entry of mod with cover");
					}
					if (versions[gameVersion][i].download == j.download && !found)
					{
						mod.Dispose();
						f.Dispose();
						if(File.Exists("mod.qmod")) File.Delete("mod.qmod");
						found = true;
					}
				}

				if (found) return;
				Console.WriteLine("Getting cover url for mod " + j.name + " - " + j.version + " for " + gameVersion);
				j.cover = GetCoverUrl(j, mod.CoverImagePath);
				if (j.cover == "")
				{
					Console.ForegroundColor = ConsoleColor.Red;
					Console.WriteLine("Cover not found");
					Console.ForegroundColor = ConsoleColor.White;
				}
				else
				{
					Console.ForegroundColor = ConsoleColor.Green;
					Console.WriteLine("Cover found at " + j.cover);
					Console.ForegroundColor = ConsoleColor.White;
				}
				Console.WriteLine("Added mod " + j.name + " - " + j.version + " for " + gameVersion + " to list.");
				mod.Dispose();
				f.Dispose();
				if(File.Exists("mod.qmod")) File.Delete("mod.qmod");
				versions[gameVersion].Add(j);
			} catch(Exception e)
			{
				client.Dispose();
				Console.WriteLine("failed: " + e.ToString());
			}
			
		}

		private string GetCoverUrl(ModJSONMod modJsonMod, string coverFileName)
		{
			if (coverFileName == "") return "";
			string rawLink = "https://raw.githubusercontent.com/" + modJsonMod.source.Split('/')[3] + "/" +
			                 modJsonMod.source.Split('/')[4] + "/";
			Console.WriteLine(rawLink + "master/" + coverFileName);
			if(DoesUrlExit(rawLink + "master/" + coverFileName)) return rawLink + "master/" + coverFileName;
			if(DoesUrlExit(rawLink + "main/" + coverFileName)) return rawLink + "main/" + coverFileName;
			
			return "";
		}

		private bool DoesUrlExit(string url)
		{
			try
			{
				//Creating the HttpWebRequest
				HttpWebRequest request = HttpWebRequest.Create(url) as HttpWebRequest;
				//Setting the Request method HEAD, you can also use GET too.
				request.Method = "HEAD";
				request.Headers.Add("authorization", File.ReadAllText("token.txt"));
				request.Headers.Add("User-Agent", "ModUpdater/0.1");
				//Getting the Web Response.
				HttpWebResponse response = (HttpWebResponse)request.GetResponse();
				//Returns TRUE if the Status code == 200
				bool exists = response.StatusCode == HttpStatusCode.OK;
				response.Close();
				return exists;
			}
			catch(Exception e)
			{
				Console.WriteLine(e.ToString());
				//Any exception will returns false.
				return false;
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
		public string cover { get; set; } = null;
		public string modloader { get; set; } = ModLoader.QuestLoader.ToString();
	}
}
