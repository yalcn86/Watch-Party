using Microsoft.EntityFrameworkCore;

namespace WhatchParty.Models;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
        // KİLİT KALDIRILDI: EnsureCreated satırını tamamen söküp attık şef.
        // Artık veritabanı kontrolü tamamen terminal komutlarımızla senkronize olacak.
    }

    // Sistemdeki siber kimliklerin (Kullanıcıların) tutulduğu tablo
    public DbSet<User> Users { get; set; }

    // Senkronize akış tünellerinin (Odaların) tutulduğu tablo
    public DbSet<Room> Rooms { get; set; }
}