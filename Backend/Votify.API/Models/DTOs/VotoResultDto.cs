namespace Votify.API.Models.DTOs
{
    public class VotoResultDto
    {
        public long IdVotacion { get; set; }
        public DashboardResponseDto Dashboard { get; set; } = new DashboardResponseDto();
    }
}
