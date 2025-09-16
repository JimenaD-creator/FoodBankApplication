// nativewind.d.ts
import "react-native";
import { NativeWindStyleSheet } from "nativewind";

declare module "react-native" {
  interface ViewProps extends NativeWindStyleSheet {}
  interface TextProps extends NativeWindStyleSheet {}
  interface TextInputProps extends NativeWindStyleSheet {}
  interface ImageProps extends NativeWindStyleSheet {}
  interface ScrollViewProps extends NativeWindStyleSheet {}
}
