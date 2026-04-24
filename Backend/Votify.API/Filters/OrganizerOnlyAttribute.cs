using Microsoft.AspNetCore.Mvc;

namespace Votify.API.Filters
{
    public class OrganizerOnlyAttribute : ServiceFilterAttribute
    {
        public OrganizerOnlyAttribute() : base(typeof(OrganizerOnlyFilter))
        {
        }
    }
}