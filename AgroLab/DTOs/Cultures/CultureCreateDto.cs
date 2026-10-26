using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Cultures
{
    public class CultureCreateDto
    {
        public string Name { get; set; } = null!;

        // репродукция → (показатель → значение)
        public Dictionary<string, Dictionary<string, string>>? SeedNorms { get; set; }
        public Dictionary<string, Dictionary<string, string>>? PotatoNorms { get; set; }
    }
}
