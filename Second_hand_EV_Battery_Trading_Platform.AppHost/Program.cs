using Aspire.Hosting;
using Aspire.Hosting.Keycloak;

var builder = DistributedApplication.CreateBuilder(args);

var keycloak = builder.AddKeycloak("keycloak", 8080)
   .WithRealmImport("keycloak")
    .WithEnvironment("KEYCLOAK_ADMIN", "admin")
    .WithEnvironment("KEYCLOAK_ADMIN_PASSWORD", "admin");

var api = builder.AddProject<Projects.Second_hand_EV_Battery_Trading_Platform>("myapi")
    .WithReference(keycloak)
    .WaitFor(keycloak);

builder.Build().Run();
