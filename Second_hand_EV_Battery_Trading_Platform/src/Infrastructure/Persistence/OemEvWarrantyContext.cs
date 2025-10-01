using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Second_hand_EV_Battery_Trading_Platform.src.Domain;

namespace Second_hand_EV_Battery_Trading_Platform.src.Infrastructure.Persistence
   ;

public partial class OemEvWarrantyContext : DbContext
{
    public OemEvWarrantyContext()
    {
    }

    public OemEvWarrantyContext(DbContextOptions<OemEvWarrantyContext> options)
        : base(options)
    {
    }

    public virtual DbSet<AuctionResult> AuctionResults { get; set; }

    public virtual DbSet<Bid> Bids { get; set; }

    public virtual DbSet<Conversation> Conversations { get; set; }

    public virtual DbSet<FeeCommission> FeeCommissions { get; set; }

    public virtual DbSet<Item> Items { get; set; }

    public virtual DbSet<Listing> Listings { get; set; }

    public virtual DbSet<Message> Messages { get; set; }

    public virtual DbSet<PaymentTransaction> PaymentTransactions { get; set; }

    public virtual DbSet<Role> Roles { get; set; }

    public virtual DbSet<User> Users { get; set; }

    public virtual DbSet<UserReputationReview> UserReputationReviews { get; set; }

//    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
//#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
//        => optionsBuilder.UseSqlServer("Server=LAPTOP-O1MT6N7J\\SQLEXPRESS;Database=OEM_EV_Warranty;Trusted_Connection=True;TrustServerCertificate=True;");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuctionResult>(entity =>
        {
            entity.HasKey(e => e.AuctionResultId).HasName("PK__AuctionR__0809D9D86E5BF2C4");

            entity.ToTable("AuctionResult");

            entity.Property(e => e.AuctionResultId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CompletedAt).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.WinnerMaxBid).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.WinningBid).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Listing).WithMany(p => p.AuctionResults)
                .HasForeignKey(d => d.ListingId)
                .HasConstraintName("FK__AuctionRe__Listi__70DDC3D8");

            entity.HasOne(d => d.Winner).WithMany(p => p.AuctionResults)
                .HasForeignKey(d => d.WinnerId)
                .HasConstraintName("FK__AuctionRe__Winne__71D1E811");
        });

        modelBuilder.Entity<Bid>(entity =>
        {
            entity.HasKey(e => e.BidId).HasName("PK__Bid__4A733D92798D03D8");

            entity.ToTable("Bid");

            entity.Property(e => e.BidId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.MaxBidAmount).HasColumnType("decimal(18, 2)");

            entity.HasOne(d => d.Bidder).WithMany(p => p.Bids)
                .HasForeignKey(d => d.BidderId)
                .HasConstraintName("FK__Bid__BidderId__6FE99F9F");

            entity.HasOne(d => d.Listing).WithMany(p => p.Bids)
                .HasForeignKey(d => d.ListingId)
                .HasConstraintName("FK__Bid__ListingId__6EF57B66");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.ConversationId).HasName("PK__Conversa__C050D877750979DB");

            entity.ToTable("Conversation");

            entity.Property(e => e.ConversationId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Buyer).WithMany(p => p.ConversationBuyers)
                .HasForeignKey(d => d.BuyerId)
                .HasConstraintName("FK__Conversat__Buyer__74AE54BC");

            entity.HasOne(d => d.Item).WithMany(p => p.Conversations)
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__Conversat__ItemI__72C60C4A");

            entity.HasOne(d => d.Seller).WithMany(p => p.ConversationSellers)
                .HasForeignKey(d => d.SellerId)
                .HasConstraintName("FK__Conversat__Selle__73BA3083");
        });

        modelBuilder.Entity<FeeCommission>(entity =>
        {
            entity.HasKey(e => e.FeeId).HasName("PK__FeeCommi__B387B229847024E8");

            entity.ToTable("FeeCommission");

            entity.Property(e => e.FeeId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.FeeName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FeeType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.SavingAmount).HasColumnType("decimal(18, 2)");
        });

        modelBuilder.Entity<Item>(entity =>
        {
            entity.HasKey(e => e.ItemId).HasName("PK__Item__727E838B396B744E");

            entity.ToTable("Item");

            entity.HasIndex(e => e.SerialNumber, "UQ__Item__048A000870549516").IsUnique();

            entity.Property(e => e.ItemId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Brand)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Condition)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Images).HasColumnType("text");
            entity.Property(e => e.ItemType)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.Model)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Price).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.SerialNumber)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Title)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.User).WithMany(p => p.Items)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Item__UserId__6B24EA82");
        });

        modelBuilder.Entity<Listing>(entity =>
        {
            entity.HasKey(e => e.ListingId).HasName("PK__Listing__BF3EBED069BB4A02");

            entity.ToTable("Listing");

            entity.Property(e => e.ListingId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.BuyNowPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.EndDate).HasColumnType("datetime");
            entity.Property(e => e.ListingType)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.StartDate).HasColumnType("datetime");
            entity.Property(e => e.StartPrice).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.BidIncrement).HasColumnType("decimal(18,2)");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Fee).WithMany(p => p.Listings)
                .HasForeignKey(d => d.FeeId)
                .HasConstraintName("FK__Listing__FeeId__6E01572D");

            entity.HasOne(d => d.Item).WithMany(p => p.Listings)
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__Listing__ItemId__6C190EBB");

            entity.HasOne(d => d.User).WithMany(p => p.Listings)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__Listing__UserId__6D0D32F4");

        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.MessageId).HasName("PK__Message__C87C0C9C01694673");

            entity.ToTable("Message");

            entity.Property(e => e.MessageId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Content).HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Conversation).WithMany(p => p.Messages)
                .HasForeignKey(d => d.ConversationId)
                .HasConstraintName("FK__Message__Convers__75A278F5");

            entity.HasOne(d => d.Sender).WithMany(p => p.Messages)
                .HasForeignKey(d => d.SenderId)
                .HasConstraintName("FK__Message__SenderI__76969D2E");
        });

        modelBuilder.Entity<PaymentTransaction>(entity =>
        {
            entity.HasKey(e => e.PaymentId).HasName("PK__PaymentT__9B556A38FE8F35D8");

            entity.ToTable("PaymentTransaction");

            entity.Property(e => e.PaymentId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Amount).HasColumnType("decimal(18, 2)");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.PaymentMethod)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.PaymentStatus)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.TransactionRef)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Fee).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.FeeId)
                .HasConstraintName("FK__PaymentTr__FeeId__7B5B524B");

            entity.HasOne(d => d.Listing).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.ListingId)
                .HasConstraintName("FK__PaymentTr__Listi__7C4F7684");

            entity.HasOne(d => d.User).WithMany(p => p.PaymentTransactions)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK__PaymentTr__UserI__7A672E12");
        });

        modelBuilder.Entity<Role>(entity =>
        {
            entity.HasKey(e => e.RoleId).HasName("PK__Role__8AFACE1A765443A9");

            entity.ToTable("Role");

            entity.HasIndex(e => e.RoleName, "UQ__Role__8A2B61601A857A21").IsUnique();

            entity.Property(e => e.RoleId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Description).HasColumnType("text");
            entity.Property(e => e.RoleName)
                .HasMaxLength(50)
                .IsUnicode(false);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CC4C3933A59D");

            entity.ToTable("User");

            entity.HasIndex(e => e.Email, "UQ__User__A9D10534E5B949DF").IsUnique();

            entity.Property(e => e.UserId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");
            entity.Property(e => e.Email)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.FullName)
                .HasMaxLength(100)
                .IsUnicode(false);
            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255)
                .IsUnicode(false);
            entity.Property(e => e.Phone)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .IsUnicode(false);
            entity.Property(e => e.Balance).HasPrecision(18, 2);
            entity.Property(e => e.UpdatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Role).WithMany(p => p.Users)
                .HasForeignKey(d => d.RoleId)
                .HasConstraintName("FK__User__RoleId__6A30C649");
        });

        modelBuilder.Entity<UserReputationReview>(entity =>
        {
            entity.HasKey(e => e.ReputationReviewId).HasName("PK__UserRepu__6B1FFF21E6FDBC5A");

            entity.ToTable("UserReputationReview");

            entity.Property(e => e.ReputationReviewId).HasDefaultValueSql("(newid())");
            entity.Property(e => e.Comment).HasColumnType("text");
            entity.Property(e => e.CreatedAt).HasColumnType("datetime");

            entity.HasOne(d => d.Item).WithMany(p => p.UserReputationReviews)
                .HasForeignKey(d => d.ItemId)
                .HasConstraintName("FK__UserReput__ItemI__797309D9");

            entity.HasOne(d => d.Reviewee).WithMany(p => p.UserReputationReviewReviewees)
                .HasForeignKey(d => d.RevieweeId)
                .HasConstraintName("FK__UserReput__Revie__787EE5A0");

            entity.HasOne(d => d.Reviewer).WithMany(p => p.UserReputationReviewReviewers)
                .HasForeignKey(d => d.ReviewerId)
                .HasConstraintName("FK__UserReput__Revie__778AC167");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
