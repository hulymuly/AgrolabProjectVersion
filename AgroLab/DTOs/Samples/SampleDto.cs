using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

namespace AgroLab.DTOs.Samples
{
    public class SampleDto
    {
        [JsonPropertyName("id")]
        public int Id { get; set; }

        [JsonPropertyName("category")]
        public string Category { get; set; } = null!;

        [JsonPropertyName("culture_id")]
        public string? CultureId { get; set; }

        [JsonPropertyName("reproduction_id")]
        public string? ReproductionId { get; set; }

        [JsonPropertyName("customer_id")]
        public int? CustomerId { get; set; }  // опционально

        [JsonPropertyName("customer")]
        public string? Customer { get; set; }

        [JsonPropertyName("inn_kpp")]
        public string? InnKpp { get; set; }

        [JsonPropertyName("inn")]
        public string? Inn { get; set; }      // если нужно

        [JsonPropertyName("kpp")]
        public string? Kpp { get; set; }        // если нужно

        [JsonPropertyName("test_basis")]
        public string? TestBasis { get; set; }

        [JsonPropertyName("upload_date")]
        public string? UploadDate { get; set; }

        [JsonPropertyName("acceptance_file")]
        public string AcceptanceFile { get; set; } = null!;

        [JsonPropertyName("sample_receipt_date")]
        public string? SampleReceiptDate { get; set; }

        [JsonPropertyName("contract_date")]
        public string? ContractDate { get; set; }

        [JsonPropertyName("contract_number")]
        public string? ContractNumber { get; set; }

        [JsonPropertyName("test_object_name")]
        public string? TestObjectName { get; set; }

        [JsonPropertyName("sample_code")]
        public string? SampleCode { get; set; }

        [JsonPropertyName("sampling_act")]
        public string? SamplingAct { get; set; }

        [JsonPropertyName("sampling_nd")]
        public string? SamplingNd { get; set; }

        [JsonPropertyName("sample_selection")]
        public string? SampleSelection { get; set; }

        [JsonPropertyName("sampling_plan")]
        public string? SamplingPlan { get; set; }

        [JsonPropertyName("research_direction")]
        public string? ResearchDirection { get; set; }

        [JsonPropertyName("additional_info")]
        public string? AdditionalInfo { get; set; }

        [JsonPropertyName("test_duration")]
        public string? TestDuration { get; set; }

        [JsonPropertyName("test_conditions")]
        public string? TestConditions { get; set; }

        [JsonPropertyName("harvest_year")]
        public string? HarvestYear { get; set; }

        [JsonPropertyName("seed_category")]
        public string? SeedCategory { get; set; }

        [JsonPropertyName("tuber_count")]
        public string? TuberCount { get; set; }

        [JsonPropertyName("batch_number")]
        public string? BatchNumber { get; set; }

        [JsonPropertyName("batch_weight")]
        public string? BatchWeight { get; set; }

        [JsonPropertyName("storage_location")]
        public string? StorageLocation { get; set; }

        [JsonPropertyName("results_distribution")]
        public string? ResultsDistribution { get; set; }

        [JsonPropertyName("sample_storage_period")]
        public string? SampleStoragePeriod { get; set; }

        [JsonPropertyName("analyses")]
        public List<SampleAnalysisDto>? Analyses { get; set; }
    }

    public class SampleAnalysisDto
    {
        [JsonPropertyName("norm_id")]
        public int NormId { get; set; }

        [JsonPropertyName("analysis")]
        public string NormName { get; set; } = null!;

        [JsonPropertyName("accept_value")]
        public string? AcceptValue { get; set; }

        [JsonPropertyName("value")]
        public string? Value { get; set; }
    }
}
