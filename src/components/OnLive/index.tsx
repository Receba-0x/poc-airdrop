import { itensMock } from "@/constants";
import Image from "next/image";
import { ItemCard2 } from "../ItemCard/ItemCard2";

export function OnLive() {
  return (
    <div className="flex items-center">
      <Image
        src="/images/on_live.png"
        className="ml-4"
        alt="on_live"
        width={42}
        height={37}
      />
      <div className="flex items-center h-[106px] overflow-hidden ml-4">
        {itensMock.map((item) => (
          <div key={item.id} className="flex-shrink-0 h-full">
            <ItemCard2 item={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
