namespace AgroLab.DTOs.Protocols
{
    public class ContractDto
    {
        public string? ContractNumber { get; set; }
        public DateTime? ContractDate { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerInn { get; set; }
        public string? CustomerKpp { get; set; }
        public string? CustomerEmail { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public string? WorkType { get; set; }
        public string? TotalAmount { get; set; }
    }
}