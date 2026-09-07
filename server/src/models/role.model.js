import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Role label is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    isSystem: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    permissions: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

roleSchema.index({ name: 1 });
roleSchema.index({ isSystem: 1 });
roleSchema.index({ isActive: 1 });

roleSchema.pre('save', function () {
  if (this.isModified('permissions')) {
    this.permissions = [...new Set(this.permissions)];
  }
});

roleSchema.methods.toSafeObject = function () {
  return {
    _id: this._id,
    name: this.name,
    label: this.label,
    description: this.description,
    isSystem: this.isSystem,
    isActive: this.isActive,
    permissions: this.permissions,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const Role = mongoose.model('Role', roleSchema);
export default Role;
