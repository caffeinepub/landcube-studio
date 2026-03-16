import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import List "mo:core/List";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";


actor {
  type Project = {
    id : Nat;
    title : Text;
    description : Text;
    category : Text;
    year : Nat;
    location : Text;
    imageIds : [Text];
    featured : Bool;
    createdAt : Int;
  };

  module Project {
    public func compare(p1 : Project, p2 : Project) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  type ProjectCategory = {
    #residential;
    #commercial;
    #publicProject;
    #institutional;
  };

  type AboutContent = {
    bio : Text;
    name : Text;
    tagline : Text;
    contactEmail : Text;
  };

  type ContactMessage = {
    id : Nat;
    name : Text;
    email : Text;
    message : Text;
    createdAt : Int;
  };

  module ContactMessage {
    public func compare(m1 : ContactMessage, m2 : ContactMessage) : Order.Order {
      Nat.compare(m1.id, m2.id);
    };
  };

  public type UserProfile = {
    name : Text;
  };

  let adminPrefix = "admin/";
  let projects = Map.empty<Nat, Project>();
  var nextProjectId = 1;
  var aboutContent : ?AboutContent = null;
  let userProfiles = Map.empty<Principal, UserProfile>();
  let contactMessages = Map.empty<Nat, ContactMessage>();
  var nextMessageId = 1;
  var initialized = false;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  public shared ({ caller }) func init() : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can initialize");
    };
    if (initialized) {
      Runtime.trap("Already initialized");
    };

    let sampleProjects = [
      {
        id = nextProjectId;
        title = "Modern Residential Home";
        description = "A contemporary residential project featuring open spaces and sustainable materials.";
        category = "Residential";
        year = 2022;
        location = "Berlin, Germany";
        imageIds = ["res1", "res2"];
        featured = true;
        createdAt = Time.now();
      },
      {
        id = nextProjectId + 1;
        title = "Urban Office Complex";
        description = "A commercial office complex with state-of-the-art facilities.";
        category = "Commercial";
        year = 2021;
        location = "Munich, Germany";
        imageIds = ["com1", "com2"];
        featured = false;
        createdAt = Time.now();
      },
      {
        id = nextProjectId + 2;
        title = "Community Center";
        description = "A public community center designed for inclusivity and accessibility.";
        category = "Public";
        year = 2023;
        location = "Hamburg, Germany";
        imageIds = ["pub1", "pub2"];
        featured = true;
        createdAt = Time.now();
      },
    ];

    for (project in sampleProjects.values()) {
      projects.add(project.id, project);
    };

    nextProjectId += sampleProjects.size();

    aboutContent := ?{
      bio = "Experienced architect specializing in sustainable design.";
      name = "Bauhaus";
      tagline = "Designing the Future";
      contactEmail = "info@bauhaus.com";
    };

    initialized := true;
  };

  func adminExists() : Bool {
    for ((_, role) in accessControlState.userRoles.entries()) {
      if (role == #admin) { return true };
    };
    false;
  };

  // Auto-register caller as a user if not yet registered
  func ensureRegistered(caller : Principal) {
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #user);
      };
      case (?_) {};
    };
  };

  public shared ({ caller }) func selfRegister() : async AccessControl.UserRole {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot register");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (?role) { role };
      case (null) {
        let role : AccessControl.UserRole = if (not adminExists()) {
          accessControlState.adminAssigned := true;
          #admin;
        } else {
          #user;
        };
        accessControlState.userRoles.add(caller, role);
        role;
      };
    };
  };

  public shared ({ caller }) func claimAdminIfNoneExists() : async AccessControl.UserRole {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot claim admin");
    };
    if (adminExists()) {
      Runtime.trap("An admin already exists");
    };
    switch (accessControlState.userRoles.get(caller)) {
      case (null) {
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
      };
      case (?_) {
        accessControlState.userRoles.add(caller, #admin);
        accessControlState.adminAssigned := true;
      };
    };
    #admin;
  };

  public shared ({ caller }) func resetAndClaimAdmin() : async AccessControl.UserRole {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous callers cannot claim admin");
    };
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reset admin");
    };
    let adminPrincipals = List.empty<Principal>();
    for ((p, role) in accessControlState.userRoles.entries()) {
      if (role == #admin) { adminPrincipals.add(p) };
    };
    for (p in adminPrincipals.values()) {
      accessControlState.userRoles.add(p, #user);
    };
    accessControlState.userRoles.add(caller, #admin);
    accessControlState.adminAssigned := true;
    #admin;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    ensureRegistered(caller);
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getAllProjects() : async [Project] {
    projects.values().toArray().sort();
  };

  public query ({ caller }) func getProjectById(id : Nat) : async Project {
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?project) { project };
    };
  };

  public query ({ caller }) func getProjectsByCategory(category : Text) : async [Project] {
    let iter = projects.values().filter(
      func(p) { Text.equal(p.category, category) }
    );
    iter.toArray();
  };

  public query ({ caller }) func getFeaturedProjects() : async [Project] {
    let iter = projects.values().filter(func(p) { p.featured });
    iter.toArray();
  };

  public query ({ caller }) func getAboutContent() : async AboutContent {
    switch (aboutContent) {
      case (null) { Runtime.trap("About content not found") };
      case (?content) { content };
    };
  };

  public shared ({ caller }) func submitContactMessage(name : Text, email : Text, message : Text) : async Nat {
    let msg : ContactMessage = {
      id = nextMessageId;
      name;
      email;
      message;
      createdAt = Time.now();
    };
    contactMessages.add(nextMessageId, msg);
    nextMessageId += 1;
    msg.id;
  };

  public query ({ caller }) func getContactMessages() : async [ContactMessage] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view contact messages");
    };
    contactMessages.values().toArray().sort();
  };

  public shared ({ caller }) func createProject(title : Text, description : Text, category : Text, year : Nat, location : Text, imageIds : [Text], featured : Bool) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create projects");
    };
    let project : Project = {
      id = nextProjectId;
      title;
      description;
      category;
      year;
      location;
      imageIds;
      featured;
      createdAt = Time.now();
    };
    projects.add(nextProjectId, project);
    nextProjectId += 1;
    project.id;
  };

  public shared ({ caller }) func updateProject(id : Nat, title : Text, description : Text, category : Text, year : Nat, location : Text, imageIds : [Text], featured : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update projects");
    };
    switch (projects.get(id)) {
      case (null) { Runtime.trap("Project not found") };
      case (?existing) {
        let updated : Project = {
          id;
          title;
          description;
          category;
          year;
          location;
          imageIds;
          featured;
          createdAt = existing.createdAt;
        };
        projects.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func deleteProject(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete projects");
    };
    if (not projects.containsKey(id)) {
      Runtime.trap("Project not found");
    };
    projects.remove(id);
  };

  public shared ({ caller }) func updateAboutContent(newContent : AboutContent) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update about content");
    };
    aboutContent := ?newContent;
  };

  public shared ({ caller }) func reorderProjects(newOrder : [Nat]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can reorder projects");
    };
    let reordered = Map.empty<Nat, Project>();
    for (id in newOrder.values()) {
      switch (projects.get(id)) {
        case (null) { Runtime.trap("Project not found in reorder") };
        case (?project) { reordered.add(id, project) };
      };
    };
    projects.clear();
    for ((id, project) in reordered.entries()) {
      projects.add(id, project);
    };
  };
};
