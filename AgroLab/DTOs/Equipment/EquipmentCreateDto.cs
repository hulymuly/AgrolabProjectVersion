using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Equipment
{
    public class EquipmentCreateDto
    {
        [Required]
        [StringLength(255)]
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [StringLength(255)]
        [JsonPropertyName("category")]
        public string? Category { get; set; }

        [StringLength(255)]
        [JsonPropertyName("model")]
        public string? Model { get; set; } // maps to LineName

        [StringLength(255)]
        [JsonPropertyName("inventoryNumber")]
        public string? InventoryNumber { get; set; }

        [StringLength(255)]
        [JsonPropertyName("factoryNumber")]
        public string? FactoryNumber { get; set; }

        [JsonPropertyName("dateOfCommissioning")]
        public DateOnly? DateOfCommissioning { get; set; }

        [StringLength(255)]
        [JsonPropertyName("certificateNumber")]
        public string? CertificateNumber { get; set; }

        [JsonPropertyName("inspectionDate")]
        public DateOnly? InspectionDate { get; set; }

        [JsonPropertyName("validUntilDate")]
        public DateOnly? ValidUntilDate { get; set; } // maps to NextInspectionDate

        [JsonPropertyName("width")]
        [Range(0, 10000)]
        public decimal? Width { get; set; }

        [JsonPropertyName("length")]
        [Range(0, 10000)]
        public decimal? Length { get; set; } // maps to Diameter

        [JsonPropertyName("height")]
        [Range(0, 10000)]
        public decimal? Height { get; set; }

        [JsonPropertyName("depth")]
        [Range(0, 10000)]
        public decimal? Depth { get; set; }

        [JsonPropertyName("dateOfDecommissioning")]
        public DateOnly? DateOfDecommissioning { get; set; } // maps to GoodsEntryDate
    }
}