using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Samples
{
    public class SampleAnalysisInputDto
    {
        [JsonPropertyName("sample_id")]
        public int SampleId { get; set; }

        [JsonPropertyName("category")]
        public string Category { get; set; } = null!; // seeds, soil, potatoes

        [JsonPropertyName("analyses")]
        public List<SampleAnalysisValueDto> Analyses { get; set; } = new();
        [JsonPropertyName("passes_standard")]
        public bool? PassesStandard { get; set; }

        [JsonPropertyName("notes")]
        public string? Notes { get; set; }

    }

    public class SampleAnalysisValueDto
    {
        [JsonPropertyName("norm_id")]
        public int NormId { get; set; }

        [JsonPropertyName("value")]
        public string Value { get; set; } = null!;
    }
}
