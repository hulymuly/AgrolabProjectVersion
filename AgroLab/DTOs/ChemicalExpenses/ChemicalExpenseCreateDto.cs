namespace AgroLab.DTOs.ChemicalExpenses
{
    public class ChemicalExpenseCreateDto
    {
        public int? ReagentId { get; set; }
        public DateOnly ExpenseDate { get; set; }
        public decimal QuantityUsed { get; set; }
        public string? GostMethod { get; set; }
        public string? Solution { get; set; }
        public decimal? SolutionQuantity { get; set; }
        public string? Storage { get; set; }
        public DateOnly? ExpirationDate { get; set; }
    }
}
