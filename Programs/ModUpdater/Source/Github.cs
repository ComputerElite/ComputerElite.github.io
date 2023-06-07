using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace ModUpdater
{
	internal class Github
	{
		public static List<GithubRelease> GetReleases(string user, string repo)
		{
			WebClient c = new WebClient();
			c.Headers.Add("User-Agent", "ModUpdater/0.1");
			c.Headers.Add("authorization", File.ReadAllText("token.txt"));
			return JsonSerializer.Deserialize<List<GithubRelease>>(c.DownloadString("https://api.github.com/repos/" + user + "/" + repo + "/releases"));
		}

		public static string GetUser(string url)
		{ 
			return url.Split('/')[3];
		}

		public static string GetRepo(string url)
		{
			return url.Split('/')[4];
		}
		public static string GetTagName(string url)
		{
			return url.Split('/')[7];
		}
	}
	
	public class GithubRelease
	{
		public string url { get; set; } = "";
		public string tag_name { get; set; } = "";
		public string body { get; set; } = "";
		public bool prerelease { get; set; } = false;
		public bool draft { get; set; } = false;
		public GithubAuthor author { get; set; } = new GithubAuthor();
		public List<GithubAsset> assets { get; set; } = new List<GithubAsset>();
		public int comparedToCurrentVersion = -2; //0 = same, -1 = earlier, 1 = newer, -2 Error

		public List<string> GetDownloads()
		{
			List<string> downloads = new List<string>();
			foreach (GithubAsset a in assets)
			{
				if (a.content_type == "application/x-zip-compressed") downloads.Add(a.browser_download_url);
			}
			return downloads;
		}

		public Version GetVersion()
		{
			return new Version(tag_name);
		}
	}

	public class GithubAuthor
	{
		public string login { get; set; } = "";
	}

	public class GithubAsset
	{
		public string browser_download_url { get; set; } = "";
		public string content_type { get; set; } = "";
	}

	public class GithubCommit // stripped
	{
		public GithubCommitCommit commit { get; set; } = new GithubCommitCommit();
		public string html_url { get; set; } = "";
	}

	public class GithubCommitCommit // stripped
	{
		public string message { get; set; } = "";
		public GithubCommitCommiter author { get; set; } = new GithubCommitCommiter();
		public GithubCommitCommiter committer { get; set; } = new GithubCommitCommiter();

	}

	public class GithubCommitCommiter // stripped
	{
		public DateTime date { get; set; } = DateTime.MinValue;
		public string name { get; set; } = "";
		public string email { get; set; } = "";
	}
}
