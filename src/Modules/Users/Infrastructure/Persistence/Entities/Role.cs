using System;
using System.Collections.Generic;

namespace Modules.Users.Infrastructure.Persistence.Entities
{
    public class Role
    {
        public Guid RoleId { get; set; }
        public string? RoleName { get; set; }
        public string? Description { get; set; }
        public DateTime? CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }

        public virtual ICollection<User> Users { get; set; } = new List<User>();
    }
}