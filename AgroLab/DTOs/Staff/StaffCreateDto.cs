namespace AgroLab.DTOs.Staff
{
    public class StaffCreateDto
    {
        public string Name { get; set; }
        public string Surname { get; set; }
        public string? Patronymic { get; set; }
        public int? RoleId { get; set; }
    }
}
