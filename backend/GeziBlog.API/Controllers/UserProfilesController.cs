using GeziBlog.API.Models;
using GeziBlog.API.Dtos;
using GeziBlog.API.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GeziBlog.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class UserProfilesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserProfilesController(AppDbContext context)
        {
            _context = context;
        }

        // Yardımcı metot: Giriş yapan kullanıcının ID'sini getir
        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim != null ? int.Parse(userIdClaim.Value) : (int?)null;
        }

        /// <summary>
        /// Kullanıcı profili oluşturur (sadece giriş yapan kullanıcı için)
        /// </summary>
        [HttpPost(Name = "CreateUserProfile")]
        public async Task<ActionResult<UserProfile>> CreateUserProfile(UserProfileDto dto)
        {
            var authorId = GetCurrentUserId();
            if (authorId == null)
                return Unauthorized("Kullanıcı kimliği bulunamadı.");

            bool hasProfile = await _context.UserProfiles.AnyAsync(p => p.Id == authorId);
            if (hasProfile)
                return Conflict("Bu kullanıcı zaten bir profile sahip.");

            var author = await _context.Authors.FindAsync(authorId);
            if (author == null)
                return NotFound($"Author with ID {authorId} not found.");

            var userProfile = new UserProfile
            {
                Id = authorId.Value,
                AuthorId = authorId.Value, 
                Age = dto.Age,
                Gender = dto.Gender,
                Nationality = dto.Nationality,
                Occupation = dto.Occupation,
                City = dto.City
            };

            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserProfile), new { id = userProfile.Id }, userProfile);
        }

        /// <summary>
        /// Belirli ID'ye sahip kullanıcı profilini getirir
        /// </summary>
        [HttpGet("{id}", Name = "GetUserProfileById")]
        public async Task<ActionResult<UserProfile>> GetUserProfile(int id)
        {
            var userProfile = await _context.UserProfiles
                .Include(up => up.Author)
                .FirstOrDefaultAsync(up => up.Id == id);

            if (userProfile == null)
                return NotFound();

            return userProfile;
        }

        /// <summary>
        /// Giriş yapan kullanıcının profilini getirir
        /// </summary>
        [HttpGet("me", Name = "GetMyUserProfile")]
        public async Task<ActionResult<UserProfile>> GetMyProfile()
        {
            var authorId = GetCurrentUserId();
            if (authorId == null)
                return Unauthorized("Kullanıcı kimliği bulunamadı.");

            var userProfile = await _context.UserProfiles
                .Include(up => up.Author)
                .FirstOrDefaultAsync(up => up.Id == authorId);

            if (userProfile == null)
                return NotFound("Kullanıcının profili bulunamadı.");

            return Ok(userProfile);
        }

        /// <summary>
        /// Giriş yapan kullanıcının profilini günceller
        /// </summary>
        [HttpPut(Name = "UpdateMyUserProfile")]
        public async Task<IActionResult> UpdateMyProfile(UserProfileDto dto)
        {
            var authorId = GetCurrentUserId();
            if (authorId == null)
                return Unauthorized("Kullanıcı kimliği bulunamadı.");

            var userProfile = await _context.UserProfiles.FindAsync(authorId);
            if (userProfile == null)
                return NotFound("Profil bulunamadı.");

            // Güncelleme işlemi
            userProfile.Age = dto.Age;
            userProfile.Gender = dto.Gender;
            userProfile.Nationality = dto.Nationality;
            userProfile.Occupation = dto.Occupation;
            userProfile.City = dto.City;

            await _context.SaveChangesAsync(); // Update() gerekmez çünkü nesne tracked

            return NoContent();
        }
    }
}
