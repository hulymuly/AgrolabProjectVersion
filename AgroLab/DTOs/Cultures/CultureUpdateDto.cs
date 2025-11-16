using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Cultures
{
    public class CultureUpdateDto
    {
        public string Name { get; set; } = null!;

        [JsonIgnore]
        public string? Type { get; set; }

        public Dictionary<string, Dictionary<string, string>>? SeedNorms { get; set; }
        public Dictionary<string, Dictionary<string, string>>? PotatoNorms { get; set; }
    }
}
