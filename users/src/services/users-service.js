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

  async SignIn(userInputs) {
    const { email, password } = userInputs;

    const existingUsers = await this.repository.FindUsers({ email });

    if (existingUsers) {
      const validPassword = await ValidatePassword(
        password,
        existingUsers.password,
        existingUsers.salt
      );
      if (validPassword) {
        const token = await GenerateSignature({
          email: existingUsers.email,
          _id: existingUsers._id,
        });
        return FormateData({ id: existingUsers._id, token });
      }
    }

    return FormateData(null);
  }

  async SignUp(userInputs) {
    const { email, password, phone } = userInputs;

    // create salt
    let salt = await GenerateSalt();

    let userPassword = await GeneratePassword(password, salt);

    const existingUsers = await this.repository.CreateUsers({
      email,
      password: userPassword,
      phone,
      salt,
    });

    const token = await GenerateSignature({
      email: email,
      _id: existingUsers._id,
    });
    return FormateData({ id: existingUsers._id, token });
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
    const existingUsers = await this.repository.FindUsersById({ id });
    return FormateData(existingUsers);
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

  async ManageCart(usersId, product, qty, isRemove) {
    const cartResult = await this.repository.AddCartItem(
      usersId,
      product,
      qty,
      isRemove
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

    const { event, data } = payload;

    const { userId, product, order, qty } = data;

    switch (event) {
      case "ADD_TO_WISHLIST":
      case "REMOVE_FROM_WISHLIST":
        this.AddToWishlist(userId, product);
        break;
      case "ADD_TO_CART":
        this.ManageCart(userId, product, qty, false);
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, true);
        break;
      case "CREATE_ORDER":
        this.ManageOrder(userId, order);
        break;
      default:
        break;
    }
  }
}

module.exports = UsersService;
