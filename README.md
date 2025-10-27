# Jellyfin Quick Connect Helper Plugin

A Jellyfin plugin that adds a convenient Quick Connect button to the web interface, making it easy to generate and display Quick Connect codes for device pairing.

## Features

- 🔘 **Quick Connect Button** - Adds a dedicated button in the top-right navigation bar
- 🔢 **One-Click Code Generation** - Generate Quick Connect codes instantly without navigating to settings
- 📱 **Easy Device Pairing** - Display codes directly in the interface for quick device authentication
- 🔄 **Real-time Status** - Shows when Quick Connect is disabled with helpful prompts
- 🐳 **Docker Compatible** - Works with both Docker containers and native installations
- 🎨 **Seamless Integration** - Matches Jellyfin's native UI design

## Screenshots

The plugin adds a Quick Connect button (📱 icon) to the top-right corner of your Jellyfin interface, next to the search and user icons. Clicking it instantly generates a Quick Connect code that you can use to pair devices.

## Compatibility

- **Jellyfin Version**: 10.9.0 or higher
- **Tested on**: 10.10.7 and 10.11.0
- **Platforms**: All platforms (Linux, Docker, Windows, macOS)

## Installation

### Method 1: Manual Installation

1. Download the latest release DLL from the [Releases](https://github.com/YOUR_USERNAME/jellyfin-plugin-quickconnecthelper/releases) page
2. Create the plugin directory:
   ```bash
   mkdir -p /var/lib/jellyfin/plugins/Quick Connect Helper_1.0.0.0
   ```
   For Docker:
   ```bash
   mkdir -p /config/plugins/Quick Connect Helper_1.0.0.0
   ```
3. Copy the DLL to the plugin directory:
   ```bash
   cp Jellyfin.Plugin.QuickConnectHelper.dll /var/lib/jellyfin/plugins/Quick Connect Helper_1.0.0.0/
   ```
4. Restart Jellyfin:
   ```bash
   sudo systemctl restart jellyfin
   ```
   For Docker:
   ```bash
   docker restart jellyfin
   ```

### Method 2: Plugin Repository (Coming Soon)

Once added to the official Jellyfin plugin repository, you'll be able to install it directly from the Jellyfin Dashboard:

1. Navigate to **Dashboard → Plugins → Repositories**
2. Add this repository: `https://raw.githubusercontent.com/YOUR_USERNAME/jellyfin-plugin-quickconnecthelper/main/manifest.json`
3. Go to **Catalog** tab
4. Find "Quick Connect Helper" and click **Install**
5. Restart Jellyfin

## Usage

1. **Enable Quick Connect** (if not already enabled):
   - Go to **Dashboard → Quick Connect**
   - Toggle **Enable Quick Connect** to ON

2. **Generate a Code**:
   - Click the Quick Connect button (📱 icon) in the top-right corner
   - A dialog will appear with a 6-digit code
   - Use this code to pair your device

3. **Pair Your Device**:
   - Open your Jellyfin app on any device
   - When prompted to sign in, select "Quick Connect"
   - Enter the code displayed in the web interface
   - Your device will be automatically authenticated

## Configuration

The plugin has a simple configuration page accessible from:
**Dashboard → Plugins → Quick Connect Helper → Settings**

Currently, there are no configuration options needed - the plugin works out of the box!

## How It Works

The plugin:
1. Injects a client-side script into Jellyfin's web interface
2. Adds a Quick Connect button to the navigation bar
3. Uses Jellyfin's native Quick Connect API to generate codes
4. Displays codes in a modal dialog
5. Automatically detects and works with both Docker and native installations

## Development

### Building from Source

Requirements:
- .NET 8.0 SDK
- Jellyfin Server (for testing)

Build steps:
```bash
git clone https://github.com/YOUR_USERNAME/jellyfin-plugin-quickconnecthelper.git
cd jellyfin-plugin-quickconnecthelper
dotnet build -c Release
```

The compiled DLL will be in `bin/Release/net8.0/`

### Project Structure

```
jellyfin-plugin-quickconnecthelper/
├── Configuration/           # Plugin configuration page
│   ├── quickconnecthelper.html
│   └── quickconnecthelper.js
├── Web/                    # Client-side scripts
│   └── QuickConnectHelper.js
├── Plugin.cs              # Main plugin class
├── PluginConfiguration.cs # Configuration model
├── QuickConnectHelperController.cs # API controller
└── Jellyfin.Plugin.QuickConnectHelper.csproj
```

## Troubleshooting

### Button Not Appearing

1. **Clear browser cache**: Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to force refresh
2. **Check plugin is loaded**: Look for `[QuickConnectHelper]` messages in browser console (F12)
3. **Verify installation**: Check that the DLL exists in the plugins directory
4. **Check server logs**: Look for "Quick Connect Helper" in Jellyfin logs

### Quick Connect Disabled Message

If you see "Quick Connect is currently disabled", you need to:
1. Go to **Dashboard → Quick Connect**
2. Toggle **Enable Quick Connect** to ON
3. Click **Save**
4. Refresh the web interface

### Docker Compatibility Issues

The plugin automatically detects Docker installations. If you're having issues:
1. Check that `JELLYFIN_WEB_DIR` environment variable is set correctly
2. Verify the plugin DLL is in `/config/plugins/Quick Connect Helper_1.0.0.0/`
3. Restart the container completely (not just Jellyfin)

## Security Note

Quick Connect codes are:
- **Valid for 10 minutes** by default
- **Single-use** - automatically deactivated after pairing
- **Securely generated** by Jellyfin's core authentication system

The plugin simply provides a UI convenience feature and doesn't modify Quick Connect's security mechanisms.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built for the [Jellyfin](https://jellyfin.org/) media server
- Inspired by the need for easier device pairing workflows
- Thanks to the Jellyfin community for their excellent documentation

## Support

If you encounter any issues or have suggestions:
- Open an issue on [GitHub](https://github.com/YOUR_USERNAME/jellyfin-plugin-quickconnecthelper/issues)
- Check existing issues for similar problems
- Provide Jellyfin version, installation method (Docker/native), and relevant logs

## Changelog

### Version 1.0.0 (2025-10-27)
- ✨ Initial release
- ✅ Quick Connect button in navigation bar
- ✅ One-click code generation
- ✅ Real-time status display
- ✅ Docker and native installation support
- ✅ Cross-platform compatibility
- ✅ Material Design icon integration
- ✅ Secure autocomplete prevention