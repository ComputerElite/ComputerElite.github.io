using ModUpdater;
using System.Text.Json;

UpdateAllMods();

void UpdateAllMods()
{
	ModJSON mods = ModJSON.GetCurrentMods();
	Dictionary<string, List<string>> idAndDownload = new Dictionary<string, List<string>>();
	List<string> blacklistetDownloads = new List<string>();
	List<string> idUpdateBlacklist = new List<string>();
	if (File.Exists("blacklist.json")) blacklistetDownloads = JsonSerializer.Deserialize<List<string>>(File.ReadAllText("blacklist.json"));
	if (File.Exists("id_blacklist.json")) idUpdateBlacklist = JsonSerializer.Deserialize<List<string>>(File.ReadAllText("id_blacklist.json"));
	Console.WriteLine("Blacklisted downloads: " + blacklistetDownloads.Count);
	Console.WriteLine("Blacklisted mods to update: " + idUpdateBlacklist.Count);
	foreach (List<ModJSONMod> v in mods.versions.Values)
	{
		foreach(ModJSONMod mod in v)
		{
			if (!mod.download.Contains("github.com")) continue;
			string modId = mod.id + "-" + Github.GetUser(mod.download) + "-" + Github.GetRepo(mod.download);
			if (!idAndDownload.ContainsKey(modId)) idAndDownload.Add(modId, new List<string>());
			idAndDownload[modId].Add(mod.download);
		}
	}
	int i = 0;
	foreach (KeyValuePair<string, List<string>> d in idAndDownload)
	{
		Console.WriteLine("Waiting 2 sec to satisfy GitHub");
		Thread.Sleep(2000);
		Console.WriteLine("\n\nProcessing mod id " + d.Key + " (" + i + "/" + idAndDownload.Count + ")");
		i++;
		try
		{
			List<GithubRelease> releases = Github.GetReleases(Github.GetUser(d.Value[0]), Github.GetRepo(d.Value[0]));
			foreach (GithubRelease r in releases)
			{
				if (r.prerelease) continue;
				if (r.draft) continue;
				if (r.assets.Count == 0) continue;
				// Check if release
				bool match = false;
				foreach (string download in d.Value)
				{
					string tag = Github.GetTagName(download);
					if (r.tag_name == tag)
					{
						match = true;
						Console.WriteLine("Tag " + r.tag_name + " already in mods json, stopping after this tag");
						break;
					}
				}
				Console.WriteLine("Processing tag " + r.tag_name);
				// stop here, we got all new tags
				foreach (GithubAsset a in r.assets)
				{
					if(!blacklistetDownloads.Contains(a.browser_download_url)) mods.AddMod(a.browser_download_url);

				}
				if (match) break;
			}
		} catch (Exception e)
		{
			Console.WriteLine("Error: " + e.ToString());
		}
	}
	File.WriteAllText("mods_updated.json", JsonSerializer.Serialize(mods.versions, new JsonSerializerOptions { WriteIndented = true}));
}

