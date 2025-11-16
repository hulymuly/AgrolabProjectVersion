using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Customers
{
    public class CustomerCreateDto
    {
        [Required]
        [StringLength(255)]
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [Required]
        [StringLength(12)]
        [JsonPropertyName("inn")]
        public string Inn { get; set; }

        [Required]
        [StringLength(12)]
        [JsonPropertyName("kpp")]
        public string Kpp { get; set; }

        [Required]
        [StringLength(255)]
        [JsonPropertyName("org_and_legal_form")]
        public string OrgAndLegalForm { get; set; }

        [Required]
        [StringLength(255)]
        [JsonPropertyName("address")]
        public string Address { get; set; }
    }
}
