using System;
using System.Collections.Generic;
using System.IO;
using MediaBrowser.Common.Configuration;
using MediaBrowser.Common.Plugins;
using MediaBrowser.Model.Plugins;
using MediaBrowser.Model.Serialization;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.QuickConnectHelper
{
    public class Plugin : BasePlugin<PluginConfiguration>, IHasWebPages
    {
        private readonly ILogger<Plugin> _logger;
        private const string ScriptTag = "<script plugin=\"Quick Connect Helper\" version=\"1.0\" src=\"/api/QuickConnectHelper/clientscript\"></script>";

        public override string Name => "Quick Connect Helper";
        public override Guid Id => Guid.Parse("a1b2c3d4-e5f6-7890-abcd-ef1234567890");
        public override string Description => "Allows admins to quickly access Quick Connect for any user";

        public Plugin(IApplicationPaths applicationPaths, IXmlSerializer xmlSerializer, ILogger<Plugin> logger)
            : base(applicationPaths, xmlSerializer)
        {
            Instance = this;
            _logger = logger;
            InjectClientScript();
        }

        private void InjectClientScript()
        {
            try
            {
                // Try to find index.html in common locations
                string? indexHtmlPath = FindIndexHtml();
                
                if (indexHtmlPath == null)
                {
                    _logger.LogWarning("index.html not found in any common location. Tried: JELLYFIN_WEB_DIR env var, /usr/share/jellyfin-web/, /jellyfin/jellyfin-web/");
                    return;
                }

                _logger.LogInformation("Found index.html at {Path}", indexHtmlPath);
                var indexContents = File.ReadAllText(indexHtmlPath);

                // Remove any existing Quick Connect Helper script tags (for upgrades)
                var oldScriptPattern = @"<script[^>]*plugin=""Quick Connect Helper""[^>]*>.*?</script>";
                var regex = new System.Text.RegularExpressions.Regex(oldScriptPattern);
                var cleanedContents = regex.Replace(indexContents, string.Empty);

                // Check if already injected with correct path
                if (cleanedContents.Contains(ScriptTag))
                {
                    if (cleanedContents != indexContents)
                    {
                        File.WriteAllText(indexHtmlPath, cleanedContents);
                        _logger.LogInformation("Removed old Quick Connect Helper script tag(s) from index.html");
                    }
                    else
                    {
                        _logger.LogInformation("Quick Connect Helper script already injected in index.html");
                    }
                    return;
                }

                // Inject before closing body tag
                var closingBodyTag = "</body>";
                if (cleanedContents.Contains(closingBodyTag))
                {
                    cleanedContents = cleanedContents.Replace(closingBodyTag, ScriptTag + "\n" + closingBodyTag);
                    File.WriteAllText(indexHtmlPath, cleanedContents);
                    _logger.LogInformation("Successfully injected Quick Connect Helper script into index.html at {Path}", indexHtmlPath);
                }
                else
                {
                    _logger.LogWarning("Could not find closing body tag in index.html");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to inject Quick Connect Helper script into index.html");
            }
        }

        private string? FindIndexHtml()
        {
            // Try paths in order of preference
            var pathsToTry = new List<string>();
            
            // 1. Check JELLYFIN_WEB_DIR environment variable (Docker containers)
            var webDir = Environment.GetEnvironmentVariable("JELLYFIN_WEB_DIR");
            if (!string.IsNullOrEmpty(webDir))
            {
                pathsToTry.Add(Path.Combine(webDir, "index.html"));
            }
            
            // 2. Standard Linux package installation path
            pathsToTry.Add("/usr/share/jellyfin-web/index.html");
            
            // 3. Docker container common path
            pathsToTry.Add("/jellyfin/jellyfin-web/index.html");
            
            // Try each path
            foreach (var path in pathsToTry)
            {
                if (File.Exists(path))
                {
                    return path;
                }
            }
            
            return null;
        }

        public static Plugin? Instance { get; private set; }

        public IEnumerable<PluginPageInfo> GetPages()
        {
            return new[]
            {
                new PluginPageInfo
                {
                    Name = "quickconnecthelper",
                    EmbeddedResourcePath = GetType().Namespace + ".Configuration.quickconnecthelper.html",
                    DisplayName = "Quick Connect Helper",
                    MenuSection = "server",
                    MenuIcon = "vpn_key"
                }
            };
        }
    }
}