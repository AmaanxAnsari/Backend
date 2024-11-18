import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { OPTIONS } from "../constants.js";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating Refresh and Access Token"
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend
  const { fullName, username, email, password } = req.body;
  //validation - not empty
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Fields are Required");
  }
  // check if user already exists:username email
  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError(409, "User already Exists");
  }

  // check for images, check for avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar File is required");
  }
  // upload image to cloudinary, check for avatar
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar  is required");
  }
  //create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  // remove password and refresh token form response
  const userId = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!userId) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, userId, "User Registered Successfully!"));
});

const loginUser = asyncHandler(async (req, res) => {
  //req body ->data
  const { username, email, password } = req.body;

  // username and email check
  if (!username && !email) {
    throw new ApiError(400, "User Name or Email is required");
  }

  //find user
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  //password check
  const validPassword = await user.isPasswordCorrect(password);

  if (!validPassword) {
    throw new ApiError(401, "Invalid user credentials");
  }
  //access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  //send cookies
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  //return res

  return res
    .status(200)
    .cookie("accessToken", accessToken, OPTIONS)
    .cookie("refreshToken", refreshToken, OPTIONS)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Successfully!"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", OPTIONS)
    .clearCookie("refreshToken", OPTIONS)
    .json(new ApiResponse(200, {}, "User Loggedout Successfully"));
});

export { registerUser, loginUser, logoutUser };
