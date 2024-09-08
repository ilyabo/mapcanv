import {Separator} from "@radix-ui/react-dropdown-menu";
import {PinIcon, Share2Icon, XIcon} from "lucide-react";
import React, {FC, useCallback, useEffect, useState, MouseEvent} from "react";
import {Button} from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {useAppStore} from "../store/store";

type Props = {};

const ShareContainer: FC<Props> = (props) => {
  const {} = props;
  const guid = useAppStore((state) => state.ydoc.guid);
  const shareProject = useAppStore((state) => state.shareProject);
  const isShared = useAppStore((state) => state.isShared);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const handleShare = useCallback(
    (evt: MouseEvent) => {
      if (isShared) {
        // Copy the URL of the project to the clipboard
        navigator.clipboard.writeText(window.location.href);
        return;
      } else {
        // Share the project and update the URL
        setPinned(true);
        const guid = shareProject();
        history.replaceState({}, "", `/${guid}`);
      }
      evt.stopPropagation();
    },
    [isShared]
  );

  const handleTogglePin = useCallback(() => {
    if (!isShared) return;
    if (pinned) {
      setQrCode(null);
      setOpen(false);
      setPinned(false);
    } else {
      setPinned(true);
    }
  }, [isShared, pinned]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (isShared) {
        if (!pinned) setOpen(open);
      } else {
        setOpen(open);
      }
    },
    [isShared, pinned]
  );

  useEffect(() => {
    if (isShared && open) {
      (async () => {
        const url = window.location.href;
        const QRCode = await import("qrcode");
        const dataUrl = await new Promise<string>((res, rej) => {
          QRCode.toDataURL(url, (err, str) => {
            if (err) rej(err);
            else res(str);
          });
        });
        setQrCode(dataUrl);
      })();
    }
  }, [open, isShared, guid]);

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange} modal={!isShared}>
      <DropdownMenuTrigger asChild>
        <Button className="text-xs bg-blue-700 hover:bg-blue-600">Share</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="max-w-[200px] flex flex-col items-center">
        <DropdownMenuItem
          className="text-xs flex flex-col gap-1 items-start"
          onClick={handleShare}
        >
          <div className="flex gap-3">
            {isShared ? (
              <>
                <Share2Icon className="w-4 h-4 ml-2" />
                <span>Copy the URL</span>
              </>
            ) : (
              <>
                <Share2Icon className="w-4 h-4 ml-2" />
                <span>Share this project</span>
              </>
            )}
          </div>
          <Separator />
          <div className="flex flex-col w-full items-center text-xs text-gray-400">
            {isShared ? (
              <>
                <span>
                  Sharing this link will allow others to collaborate with you on
                  this project in real time.
                </span>
              </>
            ) : (
              <span>
                Create a new shared project based on this one to let others
                collaborate with you on it.
              </span>
            )}
          </div>
        </DropdownMenuItem>
        {isShared ? (
          <>
            {qrCode && (
              <div className="flex">
                <div className="flex-grow-0 ">
                  <img src={qrCode} alt="QR Code" />
                </div>
                {/* <Button variant="ghost" size="icon">
              <PinIcon className="w-3 h-3" />
            </Button> */}
              </div>
            )}
            <Button
              className="flex gap-1 items-center"
              variant="ghost"
              size="sm"
              onClick={handleTogglePin}
            >
              {pinned ? (
                <>
                  <XIcon className="w-3 h-3" />
                  Close
                </>
              ) : (
                <>
                  Pin this
                  <PinIcon className="w-3 h-3" />
                </>
              )}
            </Button>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ShareContainer;
