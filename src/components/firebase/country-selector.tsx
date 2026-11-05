"use client";

import type { CountryCode, CountryData } from "@firebase-oss/ui-core";
import {
  type CountrySelectorProps,
  type CountrySelectorRef,
  useCountries,
  useDefaultCountry,
} from "@firebase-oss/ui-react";
import { type Ref, useCallback, useImperativeHandle, useState } from "react";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type { CountrySelectorRef };

export function CountrySelector({
  ref,
}: Omit<CountrySelectorProps, "ref"> & { ref?: Ref<CountrySelectorRef> }) {
  const countries = useCountries();
  const defaultCountry = useDefaultCountry();
  const [selected, setSelected] = useState<CountryData>(defaultCountry);

  const setCountry = useCallback(
    (code: CountryCode | null) => {
      if (!code) {
        return;
      }
      const foundCountry = countries.find((country) => country.code === code);
      if (foundCountry) {
        setSelected(foundCountry);
      }
    },
    [countries],
  );

  useImperativeHandle(
    ref,
    () => ({
      getCountry: () => selected,
      setCountry,
    }),
    [selected, setCountry],
  );

  return (
    <Select value={selected.code} onValueChange={setCountry}>
      <SelectTrigger aria-label="Country calling code" className="w-[120px]">
        <SelectValue>
          {selected.emoji} {selected.dialCode}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.code}>
              {country.dialCode} ({country.name})
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
