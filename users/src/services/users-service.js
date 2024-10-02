const { UsersRepository } = require("../database");
const {
  FormateData,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword,
} = require("../utils");

// All Business logic will be here
class UsersService {
  constructor() {
    this.repository = new UsersRepository();
  }

  async About() {
    const about = await this.repository.About();
    return FormateData(about);
  }

  async Setting(SettingInput) {
    const setting = await this.repository.SettingAction(SettingInput);
    return FormateData(setting);
  }

  async SignIn(userInputs) {
    const { username, password } = userInputs;

    const existingUsers = await this.repository.FindUsers({ username });

    if (existingUsers) {
      const validPassword = await ValidatePassword(
        password,
        existingUsers.password,
        existingUsers.salt
      );

      if (validPassword) {
        const token = await GenerateSignature({
          username: existingUsers.username,
          _id: existingUsers._id,
        });
        return FormateData({ success: true, id: existingUsers._id, token });
      } else {
        return FormateData({
          success: false,
          message: "Invalid password",
        });
      }
    } else {
      return FormateData({
        success: false,
        message: "Username not registered",
      });
    }
  }

  async FindByUsername(username) {
    console.log(username);
    const user = await this.repository.findByEmail(username);

    return FormateData({ user });
  }

  async SignUp(userInputs) {
    const { name, username, password, phone, storeId, photo_url } = userInputs;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    const existingUsers = await this.repository.CreateUsers({
      name,
      username,
      password: userPassword,
      phone,
      storeId,
      photo_url,
      salt,
    });

    const token = await GenerateSignature({
      username: username,
      _id: existingUsers._id,
    });
    return FormateData({ id: existingUsers._id, token });
  }

  async updateUser(userInputs) {
    const { id, name, username, password, phone, storeId, photo_url } =
      userInputs;

    // Log the ID and other data for debugging
    console.log("Data:", userInputs);

    // Fetch the existing user by ID from the repository
    const existingUser = await this.repository.FindUsersById({ id });

    if (!existingUser) {
      throw new Error("User not found");
    }

    // create new salt and password if provided
    if (password) {
      let salt = await GenerateSalt();
      let userPassword = await GeneratePassword(password, salt);
      existingUser.password = userPassword;
      existingUser.salt = salt;
    }

    // Update other fields if provided
    existingUser.name = name || existingUser.name;
    existingUser.username = username || existingUser.username;
    existingUser.phone = phone || existingUser.phone;
    existingUser.storeId = storeId || existingUser.storeId;
    existingUser.photo_url = photo_url || existingUser.photo_url;

    // Save the updated user
    const updatedUser = await this.repository.UpdateUser(existingUser);

    // Generate a new token for the updated user
    const token = await GenerateSignature({
      username: updatedUser.username,
      _id: updatedUser._id,
    });

    // Return updated user ID and token
    return FormateData({ updatedUser });
  }

  async AddNewAddress(_id, userInputs) {
    const { street, postalCode, city, country } = userInputs;

    const addressResult = await this.repository.CreateAddress({
      _id,
      street,
      postalCode,
      city,
      country,
    });

    return FormateData(addressResult);
  }

  async GetProfile(id) {
    const user = await this.repository.FindUsersById({ id });
    return FormateData({ user });
  }
  async AllUser() {
    const user = await this.repository.FindAll();
    return FormateData({ user });
  }

  async GetShopingDetails(id) {
    const existingUsers = await this.repository.FindUsersById({ id });

    if (existingUsers) {
      // const orders = await this.shopingRepository.Orders(id);
      return FormateData(existingUsers);
    }
    return FormateData({ msg: "Error" });
  }

  async GetWishList(usersId) {
    const wishListItems = await this.repository.Wishlist(usersId);
    return FormateData(wishListItems);
  }

  async AddToWishlist(usersId, product) {
    const wishlistResult = await this.repository.AddWishlistItem(
      usersId,
      product
    );
    return FormateData(wishlistResult);
  }

  async ManageCart(
    userId,
    product,
    qty,
    price,
    color,
    size,
    weight,
    isUpdate,
    isRemove,
    transactionId,
    statusId
  ) {
    const cartResult = await this.repository.AddCartItem(
      userId,
      product,
      qty,
      price,
      color,
      size,
      weight,
      isUpdate,
      isRemove,
      transactionId,
      statusId
    );
    return FormateData(cartResult);
  }

  async ManageOrder(usersId, order) {
    const orderResult = await this.repository.AddOrderToProfile(usersId, order);
    return FormateData(orderResult);
  }

  async SubscribeEvents(payload) {
    console.log("Triggering.... Users Events");

    payload = JSON.parse(payload);
    console.log(payload);

    const { event, data } = payload;

    const {
      userId,
      product,
      order,
      qty,
      price,
      color,
      size,
      weight,
      transactionId,
      statusId,
    } = data;
    let response;

    switch (event) {
      case "GET_USER":
        response = await this.GetProfile(userId);
        break;
      case "ADD_TO_WISHLIST":
      case "REMOVE_FROM_WISHLIST":
        this.AddToWishlist(userId, product);
        break;
      case "ADD_TO_CART":
        this.ManageCart(
          userId,
          product,
          qty,
          price,
          color,
          size,
          weight,
          false,
          false
        );
        break;
      case "UPDATE_CART":
        response = await this.ManageCart(
          userId,
          product,
          qty,
          price,
          color,
          size,
          weight,
          true,
          false,
          transactionId,
          statusId
        );
        break;
      case "REMOVE_FROM_CART":
        response = await this.ManageCart(
          userId,
          product,
          qty,
          price,
          color,
          size,
          weight,
          false,
          true
        );
        break;
      case "CREATE_ORDER":
        response = await this.ManageOrder(userId, order);
        break;
      default:
        break;
    }
    return response;
  }
}

module.exports = UsersService;
