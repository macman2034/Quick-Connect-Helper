using System;
using System.IO;
using System.Reflection;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace Jellyfin.Plugin.QuickConnectHelper.Api
{
    /// <summary>
    /// Controller for serving the Quick Connect Helper client script.
    /// </summary>
    [ApiController]
    [Route("api/QuickConnectHelper")]
    public class QuickConnectHelperController : ControllerBase
    {
        private readonly ILogger<QuickConnectHelperController> _logger;

        /// <summary>
        /// Initializes a new instance of the <see cref="QuickConnectHelperController"/> class.
        /// </summary>
        /// <param name="logger">Instance of the <see cref="ILogger{QuickConnectHelperController}"/> interface.</param>
        public QuickConnectHelperController(ILogger<QuickConnectHelperController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Serves the Quick Connect Helper client script.
        /// </summary>
        /// <returns>The JavaScript file content.</returns>
        [HttpGet("clientscript")]
        [AllowAnonymous]
        [Produces("application/javascript")]
        public ActionResult GetClientScript()
        {
            try
            {
                var assembly = Assembly.GetExecutingAssembly();
                var resourceName = "Jellyfin.Plugin.QuickConnectHelper.Web.QuickConnectHelper.js";

                using var stream = assembly.GetManifestResourceStream(resourceName);
                if (stream == null)
                {
                    _logger.LogError("Could not find embedded resource: {ResourceName}", resourceName);
                    return NotFound();
                }

                using var reader = new StreamReader(stream, Encoding.UTF8);
                var content = reader.ReadToEnd();
                
                _logger.LogDebug("Serving Quick Connect Helper client script");
                return Content(content, "application/javascript; charset=utf-8");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to serve Quick Connect Helper client script");
                return StatusCode(500);
            }
        }
    }
}