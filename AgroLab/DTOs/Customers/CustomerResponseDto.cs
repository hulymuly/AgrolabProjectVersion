using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Customers
{
    public class CustomerResponseDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("inn")]
        public string Inn { get; set; }

        [JsonPropertyName("kpp")]
        public string Kpp { get; set; }

        [JsonPropertyName("org_and_legal_form")]
        public string OrgAndLegalForm { get; set; }

        [JsonPropertyName("address")]
        public string Address { get; set; }
    }
}
