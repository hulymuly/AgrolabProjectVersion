namespace AgroLab.DTOs.Cultures
{
    public class CultureDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Type { get; set; } = null!;

        public Dictionary<string, Dictionary<string, string>>? SeedNorms { get; set; }
        public Dictionary<string, Dictionary<string, string>>? PotatoNorms { get; set; }
    }
}
