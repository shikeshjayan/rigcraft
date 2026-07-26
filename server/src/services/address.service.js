import addressRepository from "../repositories/address.repository.js";
import ApiError from "../utils/ApiError.js";

export const createAddress = async (userId, data) => {
  if (data.isDefault) {
    await addressRepository.clearDefault(userId);
  }

  const address = await addressRepository.create({ ...data, user: userId });

  if (data.isDefault === undefined) {
    const count = await addressRepository.count({ user: userId });
    if (count === 1) {
      await addressRepository.clearDefault(userId);
      return addressRepository.setDefault(address._id, userId);
    }
  }

  return address;
};

export const getAddresses = async (userId) => {
  return addressRepository.findByUser(userId);
};

export const getAddress = async (addressId, userId) => {
  const address = await addressRepository.findById(addressId);
  if (address.user.toString() !== userId.toString()) {
    throw ApiError.notFound("Address not found");
  }
  return address;
};

export const updateAddress = async (addressId, userId, data) => {
  const address = await addressRepository.findById(addressId);
  if (address.user.toString() !== userId.toString()) {
    throw ApiError.notFound("Address not found");
  }

  if (data.isDefault) {
    await addressRepository.clearDefault(userId);
  }

  return addressRepository.updateById(addressId, data);
};

export const deleteAddress = async (addressId, userId) => {
  const address = await addressRepository.findById(addressId);
  if (address.user.toString() !== userId.toString()) {
    throw ApiError.notFound("Address not found");
  }

  await addressRepository.deleteById(addressId);

  if (address.isDefault) {
    const remaining = await addressRepository.findByUser(userId);
    if (remaining.length > 0) {
      await addressRepository.setDefault(remaining[0]._id, userId);
    }
  }
};

export const setDefaultAddress = async (addressId, userId) => {
  const address = await addressRepository.findById(addressId);
  if (address.user.toString() !== userId.toString()) {
    throw ApiError.notFound("Address not found");
  }

  await addressRepository.clearDefault(userId);
  return addressRepository.setDefault(addressId, userId);
};
