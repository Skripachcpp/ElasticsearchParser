using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ElasticsearchExample.Controllers
{
    [ApiController]
    public class HtmlController : ControllerBase
    {
        // GET api/values/5
        [HttpGet]
        [Route("api/html")]
        public async Task<string> GetLoadHtml(string link)
        {
            var httpProvider = new HttpProvider(link);
            var data = await httpProvider.GetAsync();
            return data;
        }
    }

    public class Body {
        public string Link { get; set; }

    }
}
