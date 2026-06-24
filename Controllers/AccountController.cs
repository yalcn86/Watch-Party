using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http; // Session yönetimi için gerekli kütüphane
using System.Linq;
using WhatchParty.Models;

namespace WhatchParty.Controllers;

public class AccountController : Controller
{
    private readonly AppDbContext _context;

    public AccountController(AppDbContext context)
    {
        _context = context;
    }

    // GET: /Account/Register
    public IActionResult Register()
    {
        return View();
    }

    // POST: /Account/Register
    [HttpPost]
    public IActionResult Register(User user)
    {
        if (ModelState.IsValid)
        {
            var exists = _context.Users.Any(u => u.Username == user.Username || u.Email == user.Email);
            if (exists)
            {
                ViewBag.Error = "Bu kullanıcı adı veya e-posta adresi zaten tünelde kayıtlı!";
                return View(user);
            }

            _context.Users.Add(user);
            _context.SaveChanges();
            return RedirectToAction("Login");
        }
        return View(user);
    }

    // GET: /Account/Login
    public IActionResult Login()
    {
        return View();
    }

    // POST: /Account/Login
    [HttpPost]
    public IActionResult Login(string username, string password)
    {
        var user = _context.Users.FirstOrDefault(u => u.Username == username && u.Password == password);
        
        if (user != null)
        {
            // SİBER HAFIZA PROTOKOLÜ: Giriş yapan kullanıcının adını tünel hafızasına yazıyoruz
            HttpContext.Session.SetString("Username", user.Username);
            
            return RedirectToAction("Index", "Home");
        }

        ViewBag.Error = "Kullanıcı adı veya şifre hatalı. Erişim engellendi!";
        return View();
    }
}