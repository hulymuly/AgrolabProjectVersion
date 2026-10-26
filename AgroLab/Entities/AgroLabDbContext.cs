using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace AgroLab.Entities;

public partial class AgroLabDbContext : DbContext
{
    public AgroLabDbContext()
    {
    }

    public AgroLabDbContext(DbContextOptions<AgroLabDbContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<AuthUser> AuthUsers { get; set; }

    public virtual DbSet<ChemicalExpense> ChemicalExpenses { get; set; }

    public virtual DbSet<ChemicalParish> ChemicalParishes { get; set; }

    public virtual DbSet<Culture> Cultures { get; set; }

    public virtual DbSet<Customer> Customers { get; set; }

    public virtual DbSet<Equipment> Equipment { get; set; }

    public virtual DbSet<Log> Logs { get; set; }

    public virtual DbSet<Plant> Plants { get; set; }

    public virtual DbSet<Potato> Potatoes { get; set; }

    public virtual DbSet<PotatoAnalysis> PotatoAnalyses { get; set; }

    public virtual DbSet<PotatoNorm> PotatoNorms { get; set; }

    public virtual DbSet<Protocol> Protocols { get; set; }

    public virtual DbSet<Provider> Providers { get; set; }

    public virtual DbSet<Reagent> Reagents { get; set; }

    public virtual DbSet<Reproduction> Reproductions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<Seed> Seeds { get; set; }

    public virtual DbSet<SeedAnalysis> SeedAnalyses { get; set; }

    public virtual DbSet<SeedNorm> SeedNorms { get; set; }

    public virtual DbSet<Soil> Soils { get; set; }

    public virtual DbSet<SoilAnalysis> SoilAnalyses { get; set; }


    public virtual DbSet<SoilNorm> SoilNorms { get; set; }

    public virtual DbSet<Staff> Staff { get; set; }

    

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("audit_log_pkey");

            entity.ToTable("audit_log");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Action)
                .HasMaxLength(50)
                .HasColumnName("action");
            entity.Property(e => e.NewData).HasColumnName("new_data");
            entity.Property(e => e.OldData).HasColumnName("old_data");
            entity.Property(e => e.RecordId).HasColumnName("record_id");
            entity.Property(e => e.TableName)
                .HasMaxLength(255)
                .HasColumnName("table_name");
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("timestamp");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.AuditLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("audit_log_user_id_fkey");
        });

        modelBuilder.Entity<AuthUser>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("auth_users_pkey");

            entity.ToTable("auth_users");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");

            entity.Property(e => e.Login)
                .HasMaxLength(255)
                .HasColumnName("login");
            entity.Property(e => e.Password).HasColumnName("password");
            entity.Property(e => e.UserId).HasColumnName("user_id");
        });

        modelBuilder.Entity<ChemicalExpense>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("chemical_expenses_pkey");

            entity.ToTable("chemical_expenses");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.ExpenseDate).HasColumnName("expense_date");
            entity.Property(e => e.ExpirationDate).HasColumnName("expiration_date");
            entity.Property(e => e.GostMethod)
                .HasMaxLength(255)
                .HasColumnName("gost_method");
            entity.Property(e => e.QuantityUsed)
                .HasPrecision(10, 2)
                .HasColumnName("quantity_used");
            entity.Property(e => e.ReagentId).HasColumnName("reagent_id");
            entity.Property(e => e.Solution)
                .HasMaxLength(255)
                .HasColumnName("solution");
            entity.Property(e => e.SolutionQuantity)
                .HasPrecision(10, 2)
                .HasColumnName("solution_quantity");
            entity.Property(e => e.Storage)
                .HasMaxLength(255)
                .HasColumnName("storage");

            entity.HasOne(d => d.Reagent).WithMany(p => p.ChemicalExpenses)
                .HasForeignKey(d => d.ReagentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("chemical_expenses_reagent_id_fkey");
        });

        modelBuilder.Entity<ChemicalParish>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("chemical_parish_pkey");

            entity.ToTable("chemical_parish");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.ApprovalDate).HasColumnName("approval_date");
            entity.Property(e => e.BatchNumber)
                .HasMaxLength(255)
                .HasColumnName("batch_number");
            entity.Property(e => e.ExpirationDate).HasColumnName("expiration_date");
            entity.Property(e => e.QuantityReceived)
                .HasPrecision(10, 2)
                .HasColumnName("quantity_received");
            entity.Property(e => e.ReagentId).HasColumnName("reagent_id");
            entity.Property(e => e.ReceiptDate).HasColumnName("receipt_date");
            entity.Property(e => e.ReceivedFrom)
                .HasMaxLength(255)
                .HasColumnName("received_from");
            entity.Property(e => e.SupplierId).HasColumnName("supplier_id");

            entity.HasOne(d => d.Reagent).WithMany(p => p.ChemicalParishes)
                .HasForeignKey(d => d.ReagentId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("chemical_parish_reagent_id_fkey");

            entity.HasOne(d => d.Supplier).WithMany(p => p.ChemicalParishes)
                .HasForeignKey(d => d.SupplierId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("chemical_parish_supplier_id_fkey");
        });

        modelBuilder.Entity<Culture>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("cultures_pkey");

            entity.ToTable("cultures");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Customer>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("customers_pkey");

            entity.ToTable("customers");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Address)
                .HasColumnType("character varying")
                .HasColumnName("address");
            entity.Property(e => e.Inn).HasColumnName("inn");
            entity.Property(e => e.Kpp).HasColumnName("kpp");
            entity.Property(e => e.Name)
                .HasColumnType("character varying")
                .HasColumnName("name");
            entity.Property(e => e.OrgAndLegalForm)
                .HasColumnType("character varying")
                .HasColumnName("org_and_legal_form");
        });

        modelBuilder.Entity<Equipment>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("equipment_pkey");

            entity.ToTable("equipment");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Category)
                .HasMaxLength(255)
                .HasColumnName("category");
            entity.Property(e => e.CertificateName)
                .HasMaxLength(255)
                .HasColumnName("certificate_name");
            entity.Property(e => e.CommissioningDate).HasColumnName("commissioning_date");
            entity.Property(e => e.Depth)
                .HasPrecision(10, 2)
                .HasColumnName("depth");
            entity.Property(e => e.Diameter)
                .HasPrecision(10, 2)
                .HasColumnName("diameter");
            entity.Property(e => e.FactoryName)
                .HasMaxLength(255)
                .HasColumnName("factory_name");
            entity.Property(e => e.GoodsEntryDate).HasColumnName("goods_entry_date");
            entity.Property(e => e.Height)
                .HasPrecision(10, 2)
                .HasColumnName("height");
            entity.Property(e => e.InspectionDate).HasColumnName("inspection_date");
            entity.Property(e => e.LineName)
                .HasMaxLength(255)
                .HasColumnName("line_name");
            entity.Property(e => e.InventoryNumber)
                .HasMaxLength(255)
                .HasColumnName("inventory_number");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.NextInspectionDate).HasColumnName("next_inspection_date");
            entity.Property(e => e.Width)
                .HasPrecision(10, 2)
                .HasColumnName("width");
        });

        modelBuilder.Entity<Log>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("logs_pkey");

            entity.ToTable("logs");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Action).HasColumnName("action");
            entity.Property(e => e.Timestamp)
                .HasDefaultValueSql("CURRENT_TIMESTAMP")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("timestamp");
            entity.Property(e => e.UserId).HasColumnName("user_id");

            entity.HasOne(d => d.User).WithMany(p => p.Logs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("logs_user_id_fkey");
        });

        modelBuilder.Entity<Plant>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("plants_pkey");

            entity.ToTable("plants");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptanceFile).HasColumnName("acceptance_file");
            entity.Property(e => e.AdditionalInfo)
                .HasMaxLength(255)
                .HasColumnName("additional_info");
            entity.Property(e => e.Contract1c)
                .HasMaxLength(255)
                .HasColumnName("contract_1c");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DateContract).HasColumnName("date_contract");
            entity.Property(e => e.Inn).HasColumnName("inn");
            entity.Property(e => e.Kpp).HasColumnName("kpp");
            entity.Property(e => e.ResearchDirection)
                .HasMaxLength(100)
                .HasColumnName("research_direction");
            entity.Property(e => e.SampleCode)
                .HasMaxLength(50)
                .HasColumnName("sample_code");
            entity.Property(e => e.SampleReceiptDate).HasColumnName("sample_receipt_date");
            entity.Property(e => e.SampleSelection)
                .HasMaxLength(100)
                .HasColumnName("sample_selection");
            entity.Property(e => e.SamplingAct)
                .HasMaxLength(100)
                .HasColumnName("sampling_act");
            entity.Property(e => e.SamplingNd)
                .HasMaxLength(100)
                .HasColumnName("sampling_nd");
            entity.Property(e => e.SamplingPlan)
                .HasMaxLength(100)
                .HasColumnName("sampling_plan");
            entity.Property(e => e.TestBasis)
                .HasMaxLength(255)
                .HasColumnName("test_basis");
            entity.Property(e => e.TestDuration)
                .HasMaxLength(100)
                .HasColumnName("test_duration");
            entity.Property(e => e.TestObjectName)
                .HasMaxLength(255)
                .HasColumnName("test_object_name");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("upload_date");

            entity.HasOne(d => d.Culture).WithMany(p => p.Plants)
                .HasForeignKey(d => d.CultureId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("plants_culture_id_fkey");
        });

        modelBuilder.Entity<Potato>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("potatoes_pkey");

            entity.ToTable("potatoes");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptanceFile).HasColumnName("acceptance_file");
            entity.Property(e => e.AdditionalInfo)
                .HasMaxLength(255)
                .HasColumnName("additional_info");
            entity.Property(e => e.BatchNumber)
                .HasMaxLength(100)
                .HasColumnName("batch_number");
            entity.Property(e => e.BatchWeight)
                .HasMaxLength(100)
                .HasColumnName("batch_weight");
            entity.Property(e => e.Contract1c)
                .HasMaxLength(255)
                .HasColumnName("contract_1c");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DateContract).HasColumnName("date_contract");
            entity.Property(e => e.HarvestYear).HasColumnName("harvest_year");
            entity.Property(e => e.Inn).HasColumnName("inn");
            entity.Property(e => e.Kpp).HasColumnName("kpp");
            entity.Property(e => e.ReproductionId).HasColumnName("reproduction_id");
            entity.Property(e => e.ResearchDirection)
                .HasMaxLength(100)
                .HasColumnName("research_direction");
            entity.Property(e => e.ResultsDistribution)
                .HasMaxLength(100)
                .HasColumnName("results_distribution");
            entity.Property(e => e.SampleCode)
                .HasMaxLength(50)
                .HasColumnName("sample_code");
            entity.Property(e => e.SampleReceiptDate).HasColumnName("sample_receipt_date");
            entity.Property(e => e.SampleSelection)
                .HasMaxLength(100)
                .HasColumnName("sample_selection");
            entity.Property(e => e.SampleStoragePeriod)
                .HasMaxLength(100)
                .HasColumnName("sample_storage_period");
            entity.Property(e => e.SamplingAct)
                .HasMaxLength(100)
                .HasColumnName("sampling_act");
            entity.Property(e => e.SamplingNd)
                .HasMaxLength(100)
                .HasColumnName("sampling_nd");
            entity.Property(e => e.SamplingPlan)
                .HasMaxLength(100)
                .HasColumnName("sampling_plan");
            entity.Property(e => e.SeedCategory)
                .HasMaxLength(50)
                .HasColumnName("seed_category");
            entity.Property(e => e.StorageLocation)
                .HasMaxLength(100)
                .HasColumnName("storage_location");
            entity.Property(e => e.TestBasis)
                .HasMaxLength(255)
                .HasColumnName("test_basis");
            entity.Property(e => e.TestDuration).HasColumnName("test_duration");
            entity.Property(e => e.TestObjectName)
                .HasMaxLength(255)
                .HasColumnName("test_object_name");
            entity.Property(e => e.TuberCount).HasColumnName("tuber_count");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("upload_date");

            entity.HasOne(d => d.Culture).WithMany(p => p.Potatoes)
                .HasForeignKey(d => d.CultureId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("potatoes_culture_id_fkey");

            entity.HasOne(d => d.Reproduction).WithMany(p => p.Potatoes)
                .HasForeignKey(d => d.ReproductionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("potatoes_reproduction_id_fkey");
            entity.Property(e => e.PassesStandard).HasColumnName("passes_standard");
            entity.Property(e => e.Notes).HasColumnName("notes");

        });

        modelBuilder.Entity<PotatoAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("potato_analyses_pkey");

            entity.ToTable("potato_analyses");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.NormId).HasColumnName("norm_id");
            entity.Property(e => e.PotatoId).HasColumnName("potato_id");
            entity.Property(e => e.Value)
                .HasMaxLength(255)
                .HasColumnName("value");

            entity.HasOne(d => d.Norm).WithMany(p => p.PotatoAnalyses)
                .HasForeignKey(d => d.NormId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("potato_analyses_norm_id_fkey");

            entity.HasOne(d => d.Potato).WithMany(p => p.PotatoAnalyses)
                .HasForeignKey(d => d.PotatoId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("potato_analyses_potato_id_fkey");
        });

        modelBuilder.Entity<PotatoNorm>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("potato_norms_pkey");

            entity.ToTable("potato_norms");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptValue)
                .HasMaxLength(255)
                .HasColumnName("accept_value");
            entity.Property(e => e.Analysis).HasColumnName("analysis");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.ReproductionId).HasColumnName("reproduction_id");

            entity.HasOne(d => d.Culture).WithMany(p => p.PotatoNorms)
                .HasForeignKey(d => d.CultureId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("potato_norms_culture_id_fkey");

            entity.HasOne(d => d.Reproduction).WithMany(p => p.PotatoNorms)
                .HasForeignKey(d => d.ReproductionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("potato_norms_reproduction_id_fkey");
        });

        modelBuilder.Entity<Protocol>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("protocol_pkey");

            entity.ToTable("protocol");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Protocol1).HasColumnName("protocol");
        });

        modelBuilder.Entity<Provider>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("provider_pkey");

            entity.ToTable("provider");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Adress)
                .HasMaxLength(255)
                .HasColumnName("adress");
            entity.Property(e => e.ContactInfo)
                .HasMaxLength(255)
                .HasColumnName("contact_info");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Reagent>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("reagent_pkey");

            entity.ToTable("reagent");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
        });

        modelBuilder.Entity<Reproduction>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("reproductions_pkey");

            entity.ToTable("reproductions");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Name).HasColumnName("name");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("role_pkey");

            entity.ToTable("role");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.Role1)
                .HasMaxLength(255)
                .HasColumnName("role");
        });

        modelBuilder.Entity<Seed>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("seeds_pkey");

            entity.ToTable("seeds");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptanceFile).HasColumnName("acceptance_file");
            entity.Property(e => e.AdditionalInfo)
                .HasMaxLength(255)
                .HasColumnName("additional_info");
            entity.Property(e => e.BatchNumber)
                .HasMaxLength(100)
                .HasColumnName("batch_number");
            entity.Property(e => e.BatchWeight)
                .HasMaxLength(100)
                .HasColumnName("batch_weight");
            entity.Property(e => e.Contract1c)
                .HasMaxLength(255)
                .HasColumnName("contract_1c");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DateContract).HasColumnName("date_contract");
            entity.Property(e => e.HarvestYear).HasColumnName("harvest_year");
            entity.Property(e => e.Inn).HasColumnName("inn");
            entity.Property(e => e.Kpp).HasColumnName("kpp");
            entity.Property(e => e.ReproductionId).HasColumnName("reproduction_id");
            entity.Property(e => e.ResearchDirection)
                .HasMaxLength(100)
                .HasColumnName("research_direction");
            entity.Property(e => e.ResultsDistribution)
                .HasMaxLength(100)
                .HasColumnName("results_distribution");
            entity.Property(e => e.SampleCode)
                .HasMaxLength(50)
                .HasColumnName("sample_code");
            entity.Property(e => e.SampleReceiptDate).HasColumnName("sample_receipt_date");
            entity.Property(e => e.SampleSelection)
                .HasMaxLength(100)
                .HasColumnName("sample_selection");
            entity.Property(e => e.SampleStoragePeriod)
                .HasMaxLength(100)
                .HasColumnName("sample_storage_period");
            entity.Property(e => e.SamplingAct)
                .HasMaxLength(100)
                .HasColumnName("sampling_act");
            entity.Property(e => e.SamplingNd)
                .HasMaxLength(100)
                .HasColumnName("sampling_nd");
            entity.Property(e => e.SamplingPlan)
                .HasMaxLength(100)
                .HasColumnName("sampling_plan");
            entity.Property(e => e.SeedCategory)
                .HasMaxLength(50)
                .HasColumnName("seed_category");
            entity.Property(e => e.StorageLocation)
                .HasMaxLength(100)
                .HasColumnName("storage_location");
            entity.Property(e => e.TestBasis)
                .HasMaxLength(255)
                .HasColumnName("test_basis");
            entity.Property(e => e.TestDuration)
                .HasMaxLength(100)
                .HasColumnName("test_duration");
            entity.Property(e => e.TestObjectName)
                .HasMaxLength(255)
                .HasColumnName("test_object_name");
            entity.Property(e => e.TuberCount).HasColumnName("tuber_count");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("upload_date");

            entity.HasOne(d => d.Culture).WithMany(p => p.Seeds)
                .HasForeignKey(d => d.CultureId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("seeds_culture_id_fkey");

            entity.HasOne(d => d.Reproduction).WithMany(p => p.Seeds)
                .HasForeignKey(d => d.ReproductionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("seeds_reproduction_id_fkey");
            entity.Property(e => e.PassesStandard).HasColumnName("passes_standard");
            entity.Property(e => e.Notes).HasColumnName("notes");

        });

        modelBuilder.Entity<SeedAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("seed_analyses_pkey");

            entity.ToTable("seed_analyses");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.NormId).HasColumnName("norm_id");
            entity.Property(e => e.SeedsId).HasColumnName("seeds_id");
            entity.Property(e => e.Value)
                .HasMaxLength(255)
                .HasColumnName("value");

            entity.HasOne(d => d.Norm).WithMany(p => p.SeedAnalyses)
                .HasForeignKey(d => d.NormId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("seed_analyses_norm_id_fkey");

            entity.HasOne(d => d.Seeds).WithMany(p => p.SeedAnalyses)
                .HasForeignKey(d => d.SeedsId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("seed_analyses_seeds_id_fkey");
        });

        modelBuilder.Entity<SeedNorm>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("norms_pkey");

            entity.ToTable("seed_norms");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptValue)
                .HasMaxLength(255)
                .HasColumnName("accept_value");
            entity.Property(e => e.Analysis).HasColumnName("analysis");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.ReproductionId).HasColumnName("reproduction_id");

            entity.HasOne(d => d.Culture).WithMany(p => p.SeedNorms)
                .HasForeignKey(d => d.CultureId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("norms_culture_id_fkey");

            entity.HasOne(d => d.Reproduction).WithMany(p => p.SeedNorms)
                .HasForeignKey(d => d.ReproductionId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("norms_reproduction_id_fkey");
        });

        modelBuilder.Entity<Soil>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("soil_pkey");

            entity.ToTable("soil");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptanceFile).HasColumnName("acceptance_file");
            entity.Property(e => e.Contract1c)
                .HasMaxLength(255)
                .HasColumnName("contract_1c");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
            entity.Property(e => e.CustomerId).HasColumnName("customer_id");
            entity.Property(e => e.DateContract).HasColumnName("date_contract");
            entity.Property(e => e.Inn).HasColumnName("inn");
            entity.Property(e => e.Kpp).HasColumnName("kpp");
            entity.Property(e => e.ResearchDirection)
                .HasMaxLength(100)
                .HasColumnName("research_direction");
            entity.Property(e => e.SampleReceiptDate).HasColumnName("sample_receipt_date");
            entity.Property(e => e.SampleSelection)
                .HasMaxLength(100)
                .HasColumnName("sample_selection");
            entity.Property(e => e.SamplingAct)
                .HasMaxLength(100)
                .HasColumnName("sampling_act");
            entity.Property(e => e.TestBasis)
                .HasMaxLength(255)
                .HasColumnName("test_basis");
            entity.Property(e => e.TestConditions)
                .HasMaxLength(255)
                .HasColumnName("test_conditions");
            entity.Property(e => e.TestDuration)
                .HasMaxLength(100)
                .HasColumnName("test_duration");
            entity.Property(e => e.TestObjectName)
                .HasMaxLength(255)
                .HasColumnName("test_object_name");
            entity.Property(e => e.UploadDate)
                .HasDefaultValueSql("now()")
                .HasColumnType("timestamp without time zone")
                .HasColumnName("upload_date");
            entity.Property(e => e.PassesStandard).HasColumnName("passes_standard");
            entity.Property(e => e.Notes).HasColumnName("notes");

        });

        modelBuilder.Entity<SoilAnalysis>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("soil_analyses_pkey");

            entity.ToTable("soil_analyses");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.NormId).HasColumnName("norm_id");
            entity.Property(e => e.SoilId).HasColumnName("soil_id");
            entity.Property(e => e.Value)
                .HasMaxLength(255)
                .HasColumnName("value");

            entity.HasOne(d => d.Norm).WithMany(p => p.SoilAnalyses)
                .HasForeignKey(d => d.NormId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("soil_analyses_norm_id_fkey");

            entity.HasOne(d => d.Soil).WithMany(p => p.SoilAnalyses)
                .HasForeignKey(d => d.SoilId)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("soil_analyses_soil_id_fkey");
        });

        modelBuilder.Entity<SoilNorm>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("soil_norms_pkey");

            entity.ToTable("soil_norms");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");
            entity.Property(e => e.AcceptValue)
                .HasMaxLength(255)
                .HasColumnName("accept_value");
            entity.Property(e => e.Analysis).HasColumnName("analysis");
            entity.Property(e => e.CultureId).HasColumnName("culture_id");
        });

        modelBuilder.Entity<Staff>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("staff_pkey");

            entity.ToTable("staff");

            entity.Property(e => e.Id)
                .UseIdentityAlwaysColumn()
                .HasColumnName("id");

            entity.Property(e => e.Name)
                .HasMaxLength(255)
                .HasColumnName("name");
            entity.Property(e => e.Patronymic)
                .HasMaxLength(255)
                .HasColumnName("patronymic");
            entity.Property(e => e.RoleId).HasColumnName("role_id");
            entity.Property(e => e.Surname)
                .HasMaxLength(255)
                .HasColumnName("surname");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
